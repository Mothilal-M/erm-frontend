import { useMemo, useState } from "react"

import { toast } from "@/components/ui/use-toast"
import {
  useCreatePolicy,
  useDeletePolicy,
  useFetchPolicies,
  useUpdatePolicy,
} from "@query/policy.query"

import PolicyUI from "./policy.ui"

/**
 * Policy container — fetches policies and handles CRUD operations.
 */
const PolicyPage = () => {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const { data, isLoading, isError } = useFetchPolicies()
  const { mutate: createPolicy, isPending: isCreating } = useCreatePolicy()
  const { mutate: updatePolicy, isPending: isUpdating } = useUpdatePolicy()
  const { mutate: deletePolicy, isPending: isDeleting } = useDeletePolicy()

  const policies = useMemo(() => {
    const list = data?.policies ?? []
    return list.filter((p) => {
      const matchesSearch =
        !search.trim() ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.content.toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        categoryFilter === "all" || p.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [data, search, categoryFilter])

  const handleCreate = (payload) => {
    createPolicy(payload, {
      onSuccess: () => {
        toast({
          title: "Policy created",
          description: "New policy has been added.",
        })
        setIsCreateOpen(false)
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create policy.",
          variant: "destructive",
        })
      },
    })
  }

  const handleUpdate = (payload) => {
    updatePolicy(
      { id: editingPolicy.id, ...payload },
      {
        onSuccess: () => {
          toast({
            title: "Policy updated",
            description: "Changes have been saved.",
          })
          setEditingPolicy(null)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update policy.",
            variant: "destructive",
          })
        },
      },
    )
  }

  const handleDelete = (id) => {
    setDeletingId(id)
    deletePolicy(id, {
      onSuccess: () => {
        toast({
          title: "Policy deleted",
          description: "The policy has been removed.",
        })
        setDeletingId(null)
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete policy.",
          variant: "destructive",
        })
        setDeletingId(null)
      },
    })
  }

  return (
    <PolicyUI
      policies={policies}
      totalCount={data?.total ?? 0}
      isLoading={isLoading}
      isError={isError}
      search={search}
      categoryFilter={categoryFilter}
      isCreateOpen={isCreateOpen}
      editingPolicy={editingPolicy}
      deletingId={deletingId}
      isCreating={isCreating}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
      onSearchChange={setSearch}
      onCategoryFilterChange={setCategoryFilter}
      onOpenCreate={() => setIsCreateOpen(true)}
      onCloseCreate={() => setIsCreateOpen(false)}
      onEditPolicy={setEditingPolicy}
      onCloseEdit={() => setEditingPolicy(null)}
      onCreatePolicy={handleCreate}
      onUpdatePolicy={handleUpdate}
      onDeletePolicy={handleDelete}
    />
  )
}

export default PolicyPage
