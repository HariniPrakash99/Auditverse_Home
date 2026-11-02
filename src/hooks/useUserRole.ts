import { useEffect, useState } from 'react'
import {
  detectUserRole,
  type UserRoleInfo,
} from '../services/roleService'

export function useUserRole() {
  const [roleInfo, setRoleInfo] = useState<UserRoleInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadRole = async () => {
      try {
        const info = await detectUserRole()
        if (isMounted) {
          setRoleInfo(info)
          setLoading(false)
        }
      } catch (err) {
        console.error('Error detecting user role:', err)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadRole()

    const refreshOnReturn = () => {
      if (document.visibilityState === 'visible') {
        void loadRole()
      }
    }

    window.addEventListener('focus', refreshOnReturn)
    document.addEventListener('visibilitychange', refreshOnReturn)
    const refreshInterval = window.setInterval(() => {
      void loadRole()
    }, 30000)

    return () => {
      isMounted = false
      window.removeEventListener('focus', refreshOnReturn)
      document.removeEventListener('visibilitychange', refreshOnReturn)
      window.clearInterval(refreshInterval)
    }
  }, [])

  return {
    roleInfo,
    loading,
    role: roleInfo?.role ?? 'user',
    objectId: roleInfo?.objectId ?? '',
    groupName: roleInfo?.groupName ?? '',
    environment: roleInfo?.environment ?? '',
    canManageStructure: roleInfo?.canManageStructure ?? false, // Admin only
    canManageRightSide: roleInfo?.canManageRightSide ?? false, // Admin & Content Manager
  }
}
