import { getContext } from '@microsoft/power-apps/app'
import type { IContext } from '@microsoft/power-apps/app'
import { MicrosoftEntraIDService } from '../generated/services/MicrosoftEntraIDService'

export type UserRole = 'admin' | 'content_manager' | 'user'

type EnvironmentVariableKey =
  | 'envVarAdmin'
  | 'envVarContentManager'
  | 'envVarUser'
  | 'varEnvironment'

interface EnvironmentVariableConfig {
  name: EnvironmentVariableKey
  schemaName: string
  fallbackGroupName: string
  aliases?: string[]
}

interface EnvironmentVariableValue {
  value?: string
}

interface EnvironmentVariableDefinition {
  name?: string
  schemaname?: string
  defaultvalue?: string
  environmentvariabledefinition_environmentvariablevalue?: EnvironmentVariableValue[]
}

interface RetrieveMultipleResult<T> {
  entities: T[]
}

interface XrmWebApi {
  retrieveMultipleRecords<T>(
    entityLogicalName: string,
    options?: string,
  ): Promise<RetrieveMultipleResult<T>>
}

type WindowWithXrm = Window & {
  Xrm?: {
    WebApi?: XrmWebApi
  }
}

export const ENVIRONMENT_VARIABLES: Record<
  EnvironmentVariableKey,
  EnvironmentVariableConfig
> = {
  envVarAdmin: {
    name: 'envVarAdmin',
    schemaName: 'cp_envVarAdmin',
    fallbackGroupName: 'JJC-APP-GAA-MPP-ADMIN',
  },
  envVarContentManager: {
    name: 'envVarContentManager',
    schemaName: 'cp_envVarContentManager',
    fallbackGroupName: 'JJC-APP-GAA-MPP-QA',
    aliases: ['envVarContentmanager', 'cp_envVarContentmanager'],
  },
  envVarUser: {
    name: 'envVarUser',
    schemaName: 'cp_envVarUser',
    fallbackGroupName: 'JJC-APP-GAA-MPP-DEV',
  },
  varEnvironment: {
    name: 'varEnvironment',
    schemaName: 'cp_varEnvironment',
    fallbackGroupName: 'QA',
  },
}

export interface UserRoleInfo {
  role: UserRole
  objectId: string
  groupName?: string
  userName: string
  userEmail?: string
  canManageStructure: boolean
  canManageRightSide: boolean
  environment?: string
}

const normalizeName = (value: string) => value.trim().toLocaleLowerCase()

const escapeODataString = (value: string) => value.replace(/'/g, "''")

export async function getEnvironmentVariableValue(
  envVar: EnvironmentVariableConfig,
): Promise<string> {
  const webApi = (window as WindowWithXrm).Xrm?.WebApi
  if (!webApi) {
    console.warn(
      `[RoleService] Dataverse Web API is unavailable; using fallback for ${envVar.name}.`,
    )
    return envVar.fallbackGroupName
  }

  const names = [envVar.name, ...(envVar.aliases ?? [])]
  const schemaNames = [envVar.schemaName, ...(envVar.aliases ?? [])]
  const filters = [
    ...schemaNames.map((schema) => `schemaname eq '${escapeODataString(schema)}'`),
    ...names.map((name) => `name eq '${escapeODataString(name)}'`),
  ]
  const filter =
    `?$select=name,schemaname,defaultvalue&$filter=(${filters.join(' or ')})` +
    '&$expand=environmentvariabledefinition_environmentvariablevalue($select=value)'

  const result = await webApi.retrieveMultipleRecords<EnvironmentVariableDefinition>(
    'environmentvariabledefinition',
    filter,
  )
  const normalizedSchemaName = envVar.schemaName.toLowerCase()
  const normalizedName = envVar.name.toLowerCase()
  const normalizedAliases = (envVar.aliases ?? []).map((alias) => alias.toLowerCase())
  const definition =
    result.entities.find((entry) => entry.schemaname?.toLowerCase() === normalizedSchemaName) ??
    result.entities.find((entry) => entry.schemaname?.toLowerCase() === normalizedName) ??
    result.entities.find((entry) => entry.name?.toLowerCase() === normalizedName) ??
    result.entities.find((entry) => normalizedAliases.includes(entry.name?.toLowerCase() ?? '') || normalizedAliases.includes(entry.schemaname?.toLowerCase() ?? '')) ??
    result.entities[0]
  const currentValue =
    definition?.environmentvariabledefinition_environmentvariablevalue?.[0]?.value
  const groupName = currentValue?.trim() || definition?.defaultvalue?.trim() || ''

  return groupName || envVar.fallbackGroupName
}

export function buildRoleInfo(
  role: UserRole,
  userName: string,
  userEmail: string,
  objectId: string,
  groupName?: string,
  environment?: string,
): UserRoleInfo {
  return {
    role,
    objectId,
    groupName,
    userName,
    userEmail,
    canManageStructure: role === 'admin',
    canManageRightSide: role === 'admin' || role === 'content_manager',
    environment,
  }
}

const getAzureAdGroupNames = async (
  userEmail: string,
): Promise<string[]> => {
  const membershipResult = await MicrosoftEntraIDService.GetMemberGroupsV2(
    userEmail,
    { securityEnabledOnly: false },
  )
  const groupIds = membershipResult.data?.value ?? []
  const groupResults = await Promise.all(
    groupIds.map((groupId) => MicrosoftEntraIDService.GetGroup(groupId)),
  )

  return groupResults
    .map((result) => result.data?.displayName?.trim() ?? '')
    .filter(Boolean)
}

const includesGroup = (memberships: string[], configuredGroup: string) => {
  const expected = normalizeName(configuredGroup)
  return memberships.some((membership) => normalizeName(membership) === expected)
}

export async function detectUserRole(): Promise<UserRoleInfo> {
  const context: IContext = await getContext()
  const userEmail = context.user.userPrincipalName?.trim() ?? ''
  const userName = context.user.fullName?.trim() || userEmail || 'User'
  const objectId = context.user.objectId?.replace(/[{}]/g, '').trim() ?? ''

  if (!userEmail) {
    throw new Error('The logged-in user email is unavailable from IContext.')
  }

  const [adminGroup, contentManagerGroup, userGroup, environment, memberships] =
    await Promise.all([
      getEnvironmentVariableValue(ENVIRONMENT_VARIABLES.envVarAdmin),
      getEnvironmentVariableValue(ENVIRONMENT_VARIABLES.envVarContentManager),
      getEnvironmentVariableValue(ENVIRONMENT_VARIABLES.envVarUser),
      getEnvironmentVariableValue(ENVIRONMENT_VARIABLES.varEnvironment),
      getAzureAdGroupNames(userEmail),
    ])

  const resolvedRole = includesGroup(memberships, adminGroup)
    ? 'admin'
    : includesGroup(memberships, contentManagerGroup)
      ? 'content_manager'
      : 'user'

  console.info('[RoleService] Current environment role resolution', {
    adminGroup,
    contentManagerGroup,
    userGroup,
    environment,
    memberships,
    resolvedRole,
  })

  if (includesGroup(memberships, adminGroup)) {
    return buildRoleInfo('admin', userName, userEmail, objectId, adminGroup, environment)
  }

  if (includesGroup(memberships, contentManagerGroup)) {
    return buildRoleInfo(
      'content_manager',
      userName,
      userEmail,
      objectId,
      contentManagerGroup,
      environment,
    )
  }

  if (includesGroup(memberships, userGroup)) {
    return buildRoleInfo('user', userName, userEmail, objectId, userGroup, environment)
  }

  console.warn(
    `[RoleService] ${userEmail} is not a member of any configured role group. Applying User permissions.`,
  )
  return buildRoleInfo('user', userName, userEmail, objectId, undefined, environment)
}
