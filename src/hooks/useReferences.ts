import { useCallback, useEffect, useState } from 'react'

import { Cp_refcategoriesesService } from '../generated/services/Cp_refcategoriesesService'
import { Cp_refsubcategoriesesService } from '../generated/services/Cp_refsubcategoriesesService'
import { Cp_refmastersesService } from '../generated/services/Cp_refmastersesService'
import { Cp_refsitesesService } from '../generated/services/Cp_refsitesesService'

export interface ReferenceMaster {
  id: string
  name: string
  type: 'folder' | 'link'
  link: string
  folderName: string
  libraryId?: string
  libraryName?: string
  folderParentPath: string
  folderPath: string
  sortOrder: number
  siteId: string
  siteName: string
}

export interface ReferenceSubcategory {
  id: string
  name: string
  description: string
  sortOrder: number
  items: ReferenceMaster[]
}

export interface ReferenceCategory {
  id: string
  name: string
  sortOrder: number
  subcategories: ReferenceSubcategory[]
}

export interface ReferenceCategoryDraft {
  id: string | null
  name: string
}

export interface ReferenceSubcategoryDraft {
  id: string | null
  name: string
  description?: string
}

export interface ReferenceSite {
  id: string
  name: string
  url: string
}

export interface ReferenceMasterDraft {
  id: string | null
  name: string
  type: 'folder' | 'link'
  link: string
  folderName: string
  libraryId?: string
  libraryName?: string
  folderParentPath: string
  folderPath: string
  siteId: string
}

interface ReferencesResult {
  categories: ReferenceCategory[]
  sites: ReferenceSite[]
  loading: boolean
  saving: boolean
  error: string | null
  refresh: () => Promise<void>

  saveCategories: (
    originalCategories: ReferenceCategory[],
    draftCategories: ReferenceCategoryDraft[],
  ) => Promise<void>

  saveCategorySubcategories: (
    category: ReferenceCategory,
    draftSubcategories: ReferenceSubcategoryDraft[],
  ) => Promise<void>

  saveMasters: (
    subcategory: ReferenceSubcategory,
    drafts: ReferenceMasterDraft[],
    metadata?: { title: string; description: string },
  ) => Promise<void>
}

const FOLDER_TYPE = 100000000
const LINK_TYPE = 100000001

const normalizeValue = (value: string) =>
  value.trim().toLowerCase()

const buildHierarchy = (
  categories: any[],
  subcategories: any[],
  masters: any[],
): ReferenceCategory[] => {
  return [...categories]
    .filter((category) => category.statecode !== 1)
    .sort(
      (left, right) =>
        Number(left.cp_sortorder ?? 0) -
        Number(right.cp_sortorder ?? 0),
    )
    .map((category) => {
      const categoryId = category.cp_refcategoriesid

      const categorySubcategories = [...subcategories]
        .filter(
          (subcategory) =>
            subcategory.statecode !== 1 &&
            subcategory._cp_category_value === categoryId,
        )
        .sort(
          (left, right) =>
            Number(left.cp_sortorder ?? 0) -
            Number(right.cp_sortorder ?? 0),
        )
        .map((subcategory) => {
          const subcategoryId =
            subcategory.cp_refsubcategoriesid

          const subcategoryMasters = [...masters]
            .filter(
              (master) =>
                master.statecode !== 1 &&
                master._cp_subcategory_value ===
                  subcategoryId,
            )
            .sort(
              (left, right) =>
                Number(left.cp_sortorder ?? 0) -
                Number(right.cp_sortorder ?? 0),
            )
            .map((master) => ({
              id: master.cp_refmastersid,
              name: master.cp_name ?? '',
              type:
                Number(master.cp_type) === FOLDER_TYPE
                  ? ('folder' as const)
                  : ('link' as const),
              link: master.cp_link ?? '',
              folderName: master.cp_foldername ?? '',
              libraryId: master.cp_libraryid ?? '',
              libraryName: master.cp_libraryname ?? '',
              folderParentPath:
                master.cp_folderparentpath ?? '',
              folderPath:
                master.cp_folderpath ?? '',
              sortOrder: Number(
                master.cp_sortorder ?? 0,
              ),
              siteId:
                master._cp_site_value ?? '',
              siteName:
                (master.cp_site as { cp_sitename?: string } | undefined)?.cp_sitename ?? '',
            }))

          return {
            id: subcategoryId,
            name: subcategory.cp_subcategory ?? '',
            description:
              subcategory.cp_description ?? '',
            sortOrder: Number(
              subcategory.cp_sortorder ?? 0,
            ),
            items: subcategoryMasters,
          }
        })

      return {
        id: categoryId,
        name: category.cp_category ?? '',
        sortOrder: Number(
          category.cp_sortorder ?? 0,
        ),
        subcategories: categorySubcategories,
      }
    })
}

export function useReferences(): ReferencesResult {
  const [categories, setCategories] =
    useState<ReferenceCategory[]>([])

  const [sites, setSites] =
    useState<ReferenceSite[]>([])

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const loadReferences = useCallback(
    async () => {
      try {
        setLoading(true)
        setError(null)

        const [
          categoryResult,
          subcategoryResult,
          masterResult,
          siteResult,
        ] = await Promise.all([
          Cp_refcategoriesesService.getAll(),
          Cp_refsubcategoriesesService.getAll(),
          Cp_refmastersesService.getAll(),
          Cp_refsitesesService.getAll(),
        ])

        const categoryData =
          categoryResult.data ?? []

        const subcategoryData =
          subcategoryResult.data ?? []

        const masterData =
          masterResult.data ?? []

        const siteData =
          siteResult.data ?? []

        setSites(
          siteData
            .filter(
              (site: any) =>
                site.statecode !== 1,
            )
            .map((site: any) => ({
              id: site.cp_refsitesid,
              name: site.cp_sitename ?? '',
              url: site.cp_siteurl ?? '',
            }))
            .sort((left: ReferenceSite, right: ReferenceSite) =>
              left.name.localeCompare(
                right.name,
              ),
            ),
        )

        setCategories(
          buildHierarchy(
            categoryData,
            subcategoryData,
            masterData,
          ),
        )
      } catch (caughtError) {
        console.error(
          'REFERENCE LOAD ERROR:',
          caughtError,
        )

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load References.',
        )
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const refresh = useCallback(
    async () => {
      await loadReferences()
    },
    [loadReferences],
  )

  const saveCategories = useCallback(
    async (
      originalCategories: ReferenceCategory[],
      draftCategories: ReferenceCategoryDraft[],
    ) => {
      try {
        setSaving(true)
        setError(null)

        const isGuid = (val: string | null | undefined): boolean =>
          Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val))

        const cleanedCategories = draftCategories.map((category) => ({
          id: category.id,
          name: category.name.trim(),
        }))

        const seenNames = new Set<string>()

        for (const category of cleanedCategories) {
          if (!category.name) {
            throw new Error('Category name cannot be blank.')
          }

          const normalized = normalizeValue(category.name)

          if (seenNames.has(normalized)) {
            throw new Error(`Duplicate category name: "${category.name}".`)
          }

          seenNames.add(normalized)
        }

        // Map draft categories to real Dataverse GUIDs if draft had static ID
        const resolvedDrafts = cleanedCategories.map((draft) => {
          if (isGuid(draft.id)) {
            return draft
          }
          const matchedOriginal = originalCategories.find(
            (orig) =>
              (draft.id && orig.id === draft.id) ||
              orig.name.trim().toLowerCase() === draft.name.trim().toLowerCase() ||
              normalizeValue(orig.name) === normalizeValue(draft.name),
          )
          return {
            id: matchedOriginal?.id || null,
            name: draft.name,
          }
        })

        const resolvedExistingIds = new Set(
          resolvedDrafts.map((d) => d.id).filter((id): id is string => Boolean(id)),
        )

        // 1. DELETE removed categories in Dataverse (with cascade delete for subcategories and masters)
        for (const originalCategory of originalCategories) {
          if (isGuid(originalCategory.id) && !resolvedExistingIds.has(originalCategory.id)) {
            try {
              for (const sub of originalCategory.subcategories) {
                if (isGuid(sub.id)) {
                  for (const master of sub.items) {
                    if (isGuid(master.id)) {
                      try {
                        await Cp_refmastersesService.delete(master.id)
                      } catch (mErr) {
                        console.warn('Failed to delete master during category cascade:', mErr)
                      }
                    }
                  }
                  try {
                    await Cp_refsubcategoriesesService.delete(sub.id)
                  } catch (sErr) {
                    console.warn('Failed to delete subcategory during category cascade:', sErr)
                  }
                }
              }
              await Cp_refcategoriesesService.delete(originalCategory.id)
            } catch (delErr) {
              console.error('Failed to delete reference category:', originalCategory.id, delErr)
            }
          }
        }

        // 2. CREATE or UPDATE categories in Dataverse
        for (let index = 0; index < resolvedDrafts.length; index++) {
          const draftCategory = resolvedDrafts[index]

          if (draftCategory.id && isGuid(draftCategory.id)) {
            await Cp_refcategoriesesService.update(draftCategory.id, {
              cp_category: draftCategory.name,
              cp_sortorder: index + 1,
            } as any)
          } else {
            await Cp_refcategoriesesService.create({
              cp_category: draftCategory.name,
              cp_sortorder: index + 1,
              statecode: 0,
              statuscode: 1,
            } as any)
          }
        }

        await loadReferences()
      } catch (caughtError) {
        console.error('REFERENCE CATEGORY SAVE ERROR:', caughtError)

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to save Reference categories.'

        setError(message)

        throw caughtError
      } finally {
        setSaving(false)
      }
    },
    [loadReferences],
  )

  const saveCategorySubcategories =
    useCallback(
      async (
        category: ReferenceCategory,
        draftSubcategories:
          ReferenceSubcategoryDraft[],
      ) => {
        try {
          setSaving(true)
          setError(null)

          const isGuid = (val: string | null | undefined): boolean =>
            Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val))

          let targetCategoryId = category.id
          if (!isGuid(targetCategoryId)) {
            const catResult = await Cp_refcategoriesesService.getAll()
            const allCats = catResult.data ?? []
            const matchingCat = allCats.find(
              (c: any) =>
                c.statecode !== 1 &&
                (c.cp_category?.toLowerCase().trim() === category.name.toLowerCase().trim() ||
                  normalizeValue(c.cp_category) === normalizeValue(category.name)),
            )
            if (matchingCat?.cp_refcategoriesid) {
              targetCategoryId = matchingCat.cp_refcategoriesid
            }
          }

          const cleanedSubcategories =
            draftSubcategories.map(
              (subcategory) => ({
                id: subcategory.id,
                name:
                  subcategory.name.trim(),
                description:
                  subcategory.description?.trim() ?? '',
              }),
            )

          const seenNames =
            new Set<string>()

          for (
            const subcategory
            of cleanedSubcategories
          ) {
            if (!subcategory.name) {
              throw new Error(
                'Subcategory name cannot be blank.',
              )
            }

            const normalized =
              normalizeValue(
                subcategory.name,
              )

            if (
              seenNames.has(
                normalized,
              )
            ) {
              throw new Error(
                `Duplicate subcategory name: "${subcategory.name}".`,
              )
            }

            seenNames.add(
              normalized,
            )
          }

          // Resolve IDs to real GUIDs if draft had static ID
          const resolvedDraftSubs = cleanedSubcategories.map((draft) => {
            if (isGuid(draft.id)) return draft
            const matchedOrig = category.subcategories.find(
              (orig) =>
                (draft.id && orig.id === draft.id) ||
                orig.name.trim().toLowerCase() === draft.name.trim().toLowerCase() ||
                normalizeValue(orig.name) === normalizeValue(draft.name),
            )
            return {
              id: matchedOrig?.id || null,
              name: draft.name,
              description: draft.description,
            }
          })

          const resolvedExistingSubIds = new Set(
            resolvedDraftSubs.map((s) => s.id).filter((id): id is string => Boolean(id)),
          )

          // 1. DELETE removed subcategories (cascade deleting their masters first)
          for (
            const originalSubcategory
            of category.subcategories
          ) {
            if (
              isGuid(originalSubcategory.id) &&
              !resolvedExistingSubIds.has(
                originalSubcategory.id,
              )
            ) {
              try {
                for (const item of originalSubcategory.items) {
                  if (isGuid(item.id)) {
                    try {
                      await Cp_refmastersesService.delete(item.id)
                    } catch (mErr) {
                      console.warn('Failed to delete master during subcategory deletion:', mErr)
                    }
                  }
                }
                await Cp_refsubcategoriesesService.delete(
                  originalSubcategory.id,
                )
              } catch (sErr) {
                console.error('Failed to delete subcategory:', originalSubcategory.id, sErr)
              }
            }
          }

          // 2. CREATE or UPDATE subcategories in Dataverse
          for (
            let index = 0;
            index <
            resolvedDraftSubs.length;
            index++
          ) {
            const draftSubcategory =
              resolvedDraftSubs[index]

            if (
              draftSubcategory.id && isGuid(draftSubcategory.id)
            ) {
              await Cp_refsubcategoriesesService.update(
                draftSubcategory.id,
                {
                  cp_subcategory:
                    draftSubcategory.name,
                  cp_description:
                    draftSubcategory.description,
                  cp_sortorder:
                    index + 1,
                } as any,
              )
            } else {
              const createPayload: any = {
                cp_subcategory:
                  draftSubcategory.name,
                cp_description:
                  draftSubcategory.description !== undefined && draftSubcategory.description !== null
                    ? draftSubcategory.description
                    : '',
                cp_sortorder:
                  index + 1,
                statecode: 0,
                statuscode: 1,
              }
              if (isGuid(targetCategoryId)) {
                createPayload['cp_Category@odata.bind'] = `/cp_refcategorieses(${targetCategoryId})`
              }
              await Cp_refsubcategoriesesService.create(createPayload)
            }
          }

          await loadReferences()
        } catch (caughtError) {
          console.error(
            'REFERENCE SUBCATEGORY SAVE ERROR:',
            caughtError,
          )

          const message =
            caughtError instanceof Error
              ? caughtError.message
              : 'Unable to save Reference subcategories.'

          setError(message)

          throw caughtError
        } finally {
          setSaving(false)
        }
      },
      [loadReferences],
    )

  const saveMasters = useCallback(
    async (
      subcategory: ReferenceSubcategory,
      drafts: ReferenceMasterDraft[],
      metadata?: { title: string; description: string },
    ) => {
      try {
        setSaving(true)
        setError(null)

        const isGuid = (val: string | null | undefined): boolean =>
          Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val))

        const targetTitle = (metadata?.title ?? subcategory.name).trim()
        const targetDescription = (metadata?.description ?? subcategory.description ?? '').trim()

        let resolvedSubcategoryId = subcategory.id
        if (!isGuid(resolvedSubcategoryId)) {
          try {
            const subResult = await Cp_refsubcategoriesesService.getAll()
            const allSubs = subResult.data ?? []
            const matchingSub = allSubs.find(
              (s: any) =>
                s.statecode !== 1 &&
                (s.cp_subcategory?.toLowerCase().trim() === subcategory.name.toLowerCase().trim() ||
                  normalizeValue(s.cp_subcategory) === normalizeValue(subcategory.name) ||
                  s.cp_subcategory?.toLowerCase().includes('overview')),
            )
            if (matchingSub?.cp_refsubcategoriesid) {
              resolvedSubcategoryId = matchingSub.cp_refsubcategoriesid
            } else {
              // Create subcategory in Dataverse if missing!
              const catResult = await Cp_refcategoriesesService.getAll()
              const allCats = catResult.data ?? []
              const firstCatId = allCats[0]?.cp_refcategoriesid
              const createdSub = await Cp_refsubcategoriesesService.create({
                cp_subcategory: targetTitle || subcategory.name,
                cp_description: targetDescription || '',
                cp_sortorder: 1,
                statecode: 0,
                statuscode: 1,
                ...(firstCatId ? { 'cp_Category@odata.bind': `/cp_refcategorieses(${firstCatId})` } : {}),
              } as any)
              resolvedSubcategoryId =
                (createdSub as any)?.data?.cp_refsubcategoriesid ||
                (createdSub as any)?.cp_refsubcategoriesid ||
                (createdSub as any)?.id
            }
          } catch (lookupErr) {
            console.error('Failed to lookup or create subcategory in Dataverse:', lookupErr)
          }
        }

        // Update subcategory title & description in Dataverse
        if (isGuid(resolvedSubcategoryId) && (targetTitle || targetDescription)) {
          try {
            await Cp_refsubcategoriesesService.update(
              resolvedSubcategoryId,
              {
                cp_subcategory: targetTitle || subcategory.name,
                cp_description: targetDescription,
              } as any,
            )
          } catch (subUpdateError) {
            console.error('REFERENCE SUBCATEGORY TITLE/DESCRIPTION UPDATE ERROR:', subUpdateError)
          }
        }

        const cleanedDrafts = drafts.map((draft) => ({
          ...draft,
          name: draft.name.trim(),
          link: draft.link.trim(),
          folderName: draft.folderName.trim(),
          libraryId: (draft.libraryId ?? '').trim(),
          libraryName: (draft.libraryName ?? '').trim(),
          folderParentPath: draft.folderParentPath.trim(),
          folderPath: draft.folderPath.trim(),
        }))

        const seenNames = new Set<string>()
        const seenLinks = new Set<string>()

        for (const draft of cleanedDrafts) {
          if (!draft.name) {
            throw new Error('Folder/Link name cannot be blank.')
          }
          const normalizedName = normalizeValue(draft.name)
          if (seenNames.has(normalizedName)) {
            throw new Error(`Duplicate resource name: "${draft.name}".`)
          }
          seenNames.add(normalizedName)

          if (draft.type === 'link') {
            if (!draft.link) {
              throw new Error(`Link URL is required for "${draft.name}".`)
            }
            if (!/^https?:\/\//i.test(draft.link)) {
              throw new Error(`Link URL must use HTTPS for "${draft.name}".`)
            }
            const normalizedLink = draft.link.toLowerCase()
            if (seenLinks.has(normalizedLink)) {
              throw new Error(`Duplicate link URL: "${draft.link}".`)
            }
            seenLinks.add(normalizedLink)
          }

          if (draft.type === 'folder' && !draft.folderName) {
            throw new Error(`Library Name is required for "${draft.name}".`)
          }
        }

        // Use live Dataverse records as the source of truth; local items can carry stale temp ids after a previous save
        let liveMasters: { id: string; name: string }[] = subcategory.items
          .filter((m) => isGuid(m.id))
          .map((m) => ({ id: m.id, name: m.name }))
        try {
          const liveResult = await Cp_refmastersesService.getAll()
          const liveRows = ((liveResult as any)?.data ?? []) as any[]
          if (isGuid(resolvedSubcategoryId)) {
            liveMasters = liveRows
              .filter(
                (m) =>
                  m.statecode !== 1 &&
                  String(m._cp_subcategory_value ?? '').toLowerCase() === resolvedSubcategoryId.toLowerCase(),
              )
              .map((m) => ({ id: m.cp_refmastersid as string, name: (m.cp_name ?? '') as string }))
          }
        } catch (liveErr) {
          console.warn('Failed to load live masters before delete:', liveErr)
        }

        const originalMasterIds = new Set(liveMasters.map((m) => m.id))

        // Re-link drafts that still hold temp ids to the records already created for them
        const claimedLiveIds = new Set(
          cleanedDrafts.map((d) => d.id).filter((id): id is string => isGuid(id)),
        )
        for (const draft of cleanedDrafts) {
          if (isGuid(draft.id)) continue
          const match = liveMasters.find(
            (m) => !claimedLiveIds.has(m.id) && normalizeValue(m.name) === normalizeValue(draft.name),
          )
          if (match) {
            draft.id = match.id
            claimedLiveIds.add(match.id)
          }
        }
        cleanedDrafts.forEach((cleaned, idx) => {
          if (isGuid(cleaned.id) && drafts[idx] && drafts[idx].id !== cleaned.id) {
            drafts[idx].id = cleaned.id
          }
        })

        const draftExistingGuids = new Set(
          cleanedDrafts
            .map((draft) => draft.id)
            .filter((id): id is string => isGuid(id)),
        )

        // 1. DELETE removed masters from Dataverse
        const failedDeletes: string[] = []
        for (const originalMaster of liveMasters) {
          if (!draftExistingGuids.has(originalMaster.id)) {
            try {
              await Cp_refmastersesService.delete(originalMaster.id)
            } catch (delErr) {
              console.warn('Failed to delete master:', originalMaster.id, delErr)
              failedDeletes.push(originalMaster.name || originalMaster.id)
            }
          }
        }
        if (failedDeletes.length > 0) {
          throw new Error(`Unable to delete: ${failedDeletes.join(', ')}.`)
        }

        const isNewMaster = (draftItem: ReferenceMasterDraft): boolean => {
          if (!draftItem.id) return true
          if (
            draftItem.id.startsWith('ref-link-') ||
            draftItem.id.startsWith('ref-folder-') ||
            draftItem.id.startsWith('new-') ||
            draftItem.id.startsWith('draft-') ||
            draftItem.id.startsWith('temp-') ||
            draftItem.id.startsWith('ref-m-')
          ) {
            return true
          }
          if (!isGuid(draftItem.id)) return true
          return !originalMasterIds.has(draftItem.id)
        }

        // 2. CREATE or UPDATE masters in Dataverse
        for (let index = 0; index < cleanedDrafts.length; index++) {
          const draft = cleanedDrafts[index]

          const commonFields: any = {
            cp_name: draft.name,
            cp_type: draft.type === 'folder' ? FOLDER_TYPE : LINK_TYPE,
            cp_sortorder: index + 1,
            statecode: 0,
            statuscode: 1,
            cp_link: draft.type === 'folder' ? '' : draft.link,
            cp_foldername: draft.type === 'folder' ? draft.folderName : '',
            cp_libraryid: draft.type === 'folder' ? (draft.libraryId ?? '') : '',
            cp_libraryname: draft.type === 'folder' ? (draft.libraryName ?? '') : '',
            cp_folderparentpath: draft.type === 'folder' ? draft.folderParentPath : '',
            cp_folderpath: draft.type === 'folder' ? draft.folderPath : '',
          }

          let resolvedSiteId = ''
          if (draft.siteId) {
            const realSite = sites.find(
              (s) =>
                s.id === draft.siteId ||
                (s.url && draft.siteId.includes(s.url)) ||
                (draft.siteId === 'site-datasolutions-default' &&
                  (s.name.toLowerCase().includes('datasolutions') ||
                    s.url.toLowerCase().includes('datasolutions'))),
            )
            resolvedSiteId = realSite?.id || (isGuid(draft.siteId) ? draft.siteId : '')
          }

          if (!isNewMaster(draft) && draft.id) {
            // Update existing record: DO NOT send @odata.bind for cp_SubCategory!
            const updatePayload: any = { ...commonFields }
            if (isGuid(resolvedSiteId)) {
              updatePayload['cp_Site@odata.bind'] = `/cp_refsiteses(${resolvedSiteId})`
            }
            await Cp_refmastersesService.update(draft.id, updatePayload)
          } else {
            // Create new record: attach subcategory and site bindings
            const createPayload: any = { ...commonFields }
            if (isGuid(resolvedSubcategoryId)) {
              createPayload['cp_SubCategory@odata.bind'] = `/cp_refsubcategorieses(${resolvedSubcategoryId})`
            }
            if (isGuid(resolvedSiteId)) {
              createPayload['cp_Site@odata.bind'] = `/cp_refsiteses(${resolvedSiteId})`
            }
            const createdResult: any = await Cp_refmastersesService.create(createPayload)
            const createdId = createdResult?.data?.cp_refmastersid ?? createdResult?.cp_refmastersid
            if (isGuid(createdId)) {
              // Hand the real Dataverse id back so child REF items can be matched to this folder
              drafts[index].id = createdId
            }
          }
        }

        await loadReferences()
      } catch (caughtError) {
        console.error('REFERENCE MASTER SAVE ERROR:', caughtError)
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to save Reference resources.'
        setError(message)
        throw caughtError
      } finally {
        setSaving(false)
      }
    },
    [loadReferences, sites],
  )

  useEffect(() => {
    void loadReferences()
  }, [loadReferences])

  return {
    categories,
    sites,
    loading,
    saving,
    error,
    refresh,
    saveCategories,
    saveCategorySubcategories,
    saveMasters,
  }
}