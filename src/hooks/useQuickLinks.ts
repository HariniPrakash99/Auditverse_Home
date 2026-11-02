import { useCallback, useEffect, useState } from 'react'

import { Cp_qlcategoriesesService } from '../generated/services/Cp_qlcategoriesesService'
import { Cp_qlsubcategoriesesService } from '../generated/services/Cp_qlsubcategoriesesService'
import { Cp_qlmastersesService } from '../generated/services/Cp_qlmastersesService'

export interface QuickLinkItem {
  id: string
  name: string
  link: string
  sortOrder: number
  isNew?: boolean
}

export interface QuickLinkSubcategory {
  id: string
  name: string
  description: string
  sortOrder: number
  items: QuickLinkItem[]
}

export interface QuickLinkCategory {
  id: string
  name: string
  sortOrder: number
  subcategories: QuickLinkSubcategory[]
}

export interface QuickLinkCategoryDraft {
  id: string | null
  name: string
}

export interface QuickLinkSubcategoryDraft {
  id: string | null
  name: string
  description?: string
}

interface QuickLinksResult {
  categories: QuickLinkCategory[]
  loading: boolean
  saving: boolean
  error: string | null
  refresh: () => Promise<void>

  saveSubcategory: (
    original: QuickLinkSubcategory,
    draft: QuickLinkSubcategory,
  ) => Promise<void>

  saveCategories: (
    originalCategories: QuickLinkCategory[],
    draftCategories: QuickLinkCategoryDraft[],
  ) => Promise<void>

  saveCategorySubcategories: (
    category: QuickLinkCategory,
    draftSubcategories: QuickLinkSubcategoryDraft[],
  ) => Promise<void>
}

/*
 * Normalize text for duplicate checking.
 */
const normalizeValue = (value: string) =>
  value.trim().toLowerCase()

/*
 * Build the hierarchy:
 *
 * QL Categories
 *      |
 *      +-- QL Subcategories
 *              |
 *              +-- QL Masters
 */
const buildHierarchy = (
  categories: any[],
  subcategories: any[],
  masters: any[],
): QuickLinkCategory[] => {
  const sortedCategories = [...categories]
    .filter((category) => category.statecode !== 1)
    .sort(
      (left, right) =>
        Number(left.cp_sortorder ?? 0) -
        Number(right.cp_sortorder ?? 0),
    )

  return sortedCategories.map((category) => {
    const categoryId = category.cp_qlcategoriesid

    const categorySubcategories = subcategories
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

    return {
      id: categoryId,
      name: category.cp_category ?? '',
      sortOrder: Number(category.cp_sortorder ?? 0),

      subcategories: categorySubcategories.map(
        (subcategory) => {
          const subcategoryId =
            subcategory.cp_qlsubcategoriesid

          const subcategoryMasters = masters
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

          return {
            id: subcategoryId,

            name: subcategory.cp_subcategory ?? '',

            description:
              subcategory.cp_description ?? '',

            sortOrder: Number(
              subcategory.cp_sortorder ?? 0,
            ),

            items: subcategoryMasters.map(
              (master) => ({
                id: master.cp_qlmastersid,

                name: master.cp_name ?? '',

                link: master.cp_link ?? '',

                sortOrder: Number(
                  master.cp_sortorder ?? 0,
                ),
              }),
            ),
          }
        },
      ),
    }
  })
}

export function useQuickLinks(): QuickLinksResult {
  const [categories, setCategories] =
    useState<QuickLinkCategory[]>([])

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  /*
   * ---------------------------------------------------------
   * Load all Quick Link Dataverse data.
   * ---------------------------------------------------------
   */
  const loadQuickLinks = useCallback(
  async () => {
    try {
      setLoading(true)
      setError(null)

      const [
        categoryResult,
        subcategoryResult,
        masterResult,
      ] = await Promise.all([
        Cp_qlcategoriesesService.getAll(),
        Cp_qlsubcategoriesesService.getAll(),
        Cp_qlmastersesService.getAll(),
      ])

      /*
       * The generated Dataverse services return
       * OperationResult<T>.
       *
       * The actual records are inside .data.
       */
      const categoryData =
        categoryResult.data ?? []

      const subcategoryData =
        subcategoryResult.data ?? []

      const masterData =
        masterResult.data ?? []

      const hierarchy = buildHierarchy(
        categoryData,
        subcategoryData,
        masterData,
      )

      setCategories(hierarchy)
    } catch (caughtError) {
      console.error(
        'QUICK LINKS LOAD ERROR:',
        caughtError,
      )

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to load Quick Links.',
      )
    } finally {
      setLoading(false)
    }
  },
  [],
)

  /*
   * ---------------------------------------------------------
   * Public refresh.
   * ---------------------------------------------------------
   */
  const refresh = useCallback(
    async () => {
      await loadQuickLinks()
    },
    [loadQuickLinks],
  )

  /*
   * ---------------------------------------------------------
   * Save a single subcategory's link items.
   *
   * This is the existing Quick Link Manage functionality.
   * ---------------------------------------------------------
   */
  const saveSubcategory = useCallback(
    async (
      original: QuickLinkSubcategory,
      draft: QuickLinkSubcategory,
    ) => {
      try {
        setSaving(true)
        setError(null)

        /*
         * Update subcategory name and description.
         */
        await Cp_qlsubcategoriesesService.update(
          draft.id,
          {
            cp_subcategory: draft.name.trim(),
            cp_description:
              draft.description.trim(),
          } as any,
        )

        /*
         * Find deleted, updated, and new master records.
         */
        const originalIds = new Set(
          original.items.map(
            (item) => item.id,
          ),
        )

        const isNewItem = (item: QuickLinkItem) =>
          Boolean(item.isNew) ||
          item.id.startsWith('new-') ||
          !originalIds.has(item.id)

        const draftExistingIds = new Set(
          draft.items
            .filter((item) => !isNewItem(item))
            .map((item) => item.id),
        )

        /*
         * Delete removed master records.
         */
        for (const originalItem of original.items) {
          if (
            !draftExistingIds.has(originalItem.id)
          ) {
            await Cp_qlmastersesService.delete(
              originalItem.id,
            )
          }
        }

        /*
         * Update existing master records.
         */
        for (
          const draftItem of draft.items
        ) {
          if (
            !isNewItem(draftItem) &&
            originalIds.has(draftItem.id)
          ) {
            await Cp_qlmastersesService.update(
              draftItem.id,
              {
                cp_name:
                  draftItem.name.trim(),

                cp_link:
                  draftItem.link.trim(),

                cp_sortorder:
                  draftItem.sortOrder,
              } as any,
            )
          }
        }

        /*
         * Create new master records.
         */
        for (
          const draftItem of draft.items
        ) {
          if (
            isNewItem(draftItem)
          ) {
            await Cp_qlmastersesService.create({
              cp_name:
                draftItem.name.trim(),

              cp_link:
                draftItem.link.trim(),

              cp_sortorder:
                draftItem.sortOrder,

              statecode: 0,

              'cp_SubCategory@odata.bind':
                `/cp_qlsubcategorieses(${draft.id})`,
            } as any)
          }
        }

        /*
         * Reload Dataverse after successful save.
         */
        await loadQuickLinks()
      } catch (caughtError) {
        console.error(
          'QUICK LINK SUBCATEGORY SAVE ERROR:',
          caughtError,
        )

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to save Quick Links.'

        setError(message)

        throw caughtError
      } finally {
        setSaving(false)
      }
    },
    [loadQuickLinks],
  )


  /*
   * ---------------------------------------------------------
   * Save Quick Link categories.
   *
   * Category identity is always the Dataverse GUID.
   * Renaming therefore updates the existing record instead
   * of deleting/recreating it.
   * ---------------------------------------------------------
   */
  const saveCategories = useCallback(
    async (
      originalCategories: QuickLinkCategory[],
      draftCategories: QuickLinkCategoryDraft[],
    ) => {
      try {
        setSaving(true)
        setError(null)

        const cleanedCategories = draftCategories.map(
          (category) => ({
            id: category.id,
            name: category.name.trim(),
          }),
        )

        const seenNames = new Set<string>()

        for (const category of cleanedCategories) {
          const normalized = normalizeValue(category.name)

          if (!normalized) {
            throw new Error('Category name cannot be blank.')
          }

          if (seenNames.has(normalized)) {
            throw new Error(
              `Duplicate category name: "${category.name}".`,
            )
          }

          seenNames.add(normalized)
        }

        const originalById = new Map(
          originalCategories.map((category) => [
            category.id,
            category,
          ]),
        )

        const draftExistingIds = new Set(
          cleanedCategories
            .map((category) => category.id)
            .filter(
              (id): id is string => Boolean(id),
            ),
        )

        /*
         * Delete categories removed from the draft.
         * Children are deleted first.
         */
        for (const originalCategory of originalCategories) {
          if (
            !draftExistingIds.has(
              originalCategory.id,
            )
          ) {
            for (const subcategory of originalCategory.subcategories) {
              for (const master of subcategory.items) {
                await Cp_qlmastersesService.delete(
                  master.id,
                )
              }

              await Cp_qlsubcategoriesesService.delete(
                subcategory.id,
              )
            }

            await Cp_qlcategoriesesService.delete(
              originalCategory.id,
            )
          }
        }

        /*
         * Update existing categories by GUID.
         * Create only categories whose id is null.
         */
        for (
          let index = 0;
          index < cleanedCategories.length;
          index++
        ) {
          const draftCategory =
            cleanedCategories[index]

          const sortOrder = index + 1

          if (
            draftCategory.id &&
            originalById.has(draftCategory.id)
          ) {
            await Cp_qlcategoriesesService.update(
              draftCategory.id,
              {
                cp_category: draftCategory.name,
                cp_sortorder: sortOrder,
              } as any,
            )
          } else {
            await Cp_qlcategoriesesService.create({
              cp_category: draftCategory.name,
              cp_sortorder: sortOrder,
              cp_subcatflag: true,
              statecode: 0,
              statuscode: 1,
            } as any)
          }
        }

        await loadQuickLinks()
      } catch (caughtError) {
        console.error(
          'QUICK LINK CATEGORY SAVE ERROR:',
          caughtError,
        )

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to save Quick Link categories.'

        setError(message)
        throw caughtError
      } finally {
        setSaving(false)
      }
    },
    [loadQuickLinks],
  )

  /*
   * ---------------------------------------------------------
   * Save subcategories under one category.
   *
   * Subcategory identity is also the Dataverse GUID.
   * Rename/reorder therefore preserves the existing lookup
   * relationship to the parent category.
   * ---------------------------------------------------------
   */
  const saveCategorySubcategories = useCallback(
    async (
      category: QuickLinkCategory,
      draftSubcategories: QuickLinkSubcategoryDraft[],
    ) => {
      try {
        setSaving(true)
        setError(null)

        const cleanedSubcategories =
          draftSubcategories.map(
            (subcategory) => ({
              id: subcategory.id,
              name: subcategory.name.trim(),
              description: subcategory.description?.trim() ?? '',
            }),
          )

        const seenNames = new Set<string>()
        const seenDescriptions = new Set<string>()

        for (const subcategory of cleanedSubcategories) {
          const normalized = normalizeValue(
            subcategory.name,
          )

          if (!normalized) {
            throw new Error(
              'Subcategory name cannot be blank.',
            )
          }

          if (seenNames.has(normalized)) {
            throw new Error(
              `Duplicate subcategory name: "${subcategory.name}".`,
            )
          }

          seenNames.add(normalized)

          if (subcategory.description) {
            const normalizedDesc = normalizeValue(subcategory.description)
            if (normalizedDesc) {
              if (seenDescriptions.has(normalizedDesc)) {
                throw new Error(
                  `Duplicate subcategory description: "${subcategory.description}".`,
                )
              }
              seenDescriptions.add(normalizedDesc)
            }
          }
        }

        const originalById = new Map(
          category.subcategories.map(
            (subcategory) => [
              subcategory.id,
              subcategory,
            ],
          ),
        )

        const draftExistingIds = new Set(
          cleanedSubcategories
            .map(
              (subcategory) =>
                subcategory.id,
            )
            .filter(
              (id): id is string =>
                Boolean(id),
            ),
        )

        /*
         * Delete subcategories removed from the draft.
         * Their QL Masters are deleted first.
         */
        for (const originalSubcategory of category.subcategories) {
          if (
            !draftExistingIds.has(
              originalSubcategory.id,
            )
          ) {
            for (const master of originalSubcategory.items) {
              await Cp_qlmastersesService.delete(
                master.id,
              )
            }

            await Cp_qlsubcategoriesesService.delete(
              originalSubcategory.id,
            )
          }
        }

        /*
         * Update existing subcategories by GUID.
         */
        for (
          let index = 0;
          index < cleanedSubcategories.length;
          index++
        ) {
          const draftSubcategory =
            cleanedSubcategories[index]

          const sortOrder = index + 1

          if (
            draftSubcategory.id &&
            originalById.has(
              draftSubcategory.id,
            )
          ) {
            await Cp_qlsubcategoriesesService.update(
              draftSubcategory.id,
              {
                cp_subcategory:
                  draftSubcategory.name,
                cp_description:
                  draftSubcategory.description,
                cp_sortorder: sortOrder,
              } as any,
            )
          } else {
            /*
             * New subcategory:
             * bind it to the EXISTING parent
             * category GUID.
             */
            await Cp_qlsubcategoriesesService.create({
              cp_subcategory:
                draftSubcategory.name,
              cp_description:
                draftSubcategory.description,
              cp_sortorder: sortOrder,
              statecode: 0,
              statuscode: 1,
              'cp_Category@odata.bind':
                `/cp_qlcategorieses(${category.id})`,
            } as any)
          }
        }

        await loadQuickLinks()
      } catch (caughtError) {
        console.error(
          'QUICK LINK SUBCATEGORY LIST SAVE ERROR:',
          caughtError,
        )

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to save subcategories.'

        setError(message)
        throw caughtError
      } finally {
        setSaving(false)
      }
    },
    [loadQuickLinks],
  )

  /*
   * Initial load.
   */
  useEffect(() => {
    void loadQuickLinks()
  }, [loadQuickLinks])

  return {
    categories,
    loading,
    saving,
    error,
    refresh,
    saveSubcategory,
    saveCategories,
    saveCategorySubcategories,
  }
}
