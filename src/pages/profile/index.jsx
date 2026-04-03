import i18n from "i18next"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useSelector } from "react-redux"

import { toast } from "@/components/ui/use-toast"
import { useTheme } from "@/lib/context/theme-provider"
import { useFetchEmployees } from "@query/employee-management.query"
import {
  useChangePassword,
  useFetchMyProfile,
  useUpdateMyProfile,
} from "@query/profile.query"

import ProfileUI from "./profile.ui"

const DEFAULT_VIEWER_ROLE = "viewer"
const INITIAL_TEAM_ID = "team-core-engineering"
const EMPTY_TEAM_DRAFT = {
  name: "",
  leadId: "",
  memberIds: [],
}
const INITIAL_TEAMS = [
  {
    id: INITIAL_TEAM_ID,
    name: "Core Engineering",
    leadId: "",
    memberIds: [],
    responsibilities: {
      attendance: "manager",
      leaveManagement: "manager",
      employeeManagement: DEFAULT_VIEWER_ROLE,
      projectManagement: "admin",
      policyManagement: "editor",
      rewardsManagement: "editor",
    },
  },
]

const createTeamId = (name) => {
  const normalizedName = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return `team-${normalizedName || "new-team"}`
}

const getDefaultResponsibilities = () => ({
  attendance: DEFAULT_VIEWER_ROLE,
  leaveManagement: DEFAULT_VIEWER_ROLE,
  employeeManagement: "none",
  projectManagement: DEFAULT_VIEWER_ROLE,
  policyManagement: DEFAULT_VIEWER_ROLE,
  rewardsManagement: DEFAULT_VIEWER_ROLE,
})

/**
 * Profile + Settings container — fetches the current user profile, handles
 * profile updates, password changes, and app preference settings.
 */
const ProfilePage = () => {
  const { t } = useTranslation()
  const userName = useSelector((state) => state.user.userName)
  const userRole = useSelector((state) => state.user.userRole)
  const employeeRole = useSelector(
    (state) => state.user.employee_management_role,
  )

  // ── Profile state ──────────────────────────────────────────────────────────
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)

  const { data: profile, isLoading, isError } = useFetchMyProfile()
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateMyProfile()
  const { mutate: changePassword, isPending: isChangingPassword } =
    useChangePassword()

  const handleUpdateProfile = (payload) => {
    updateProfile(payload, {
      onSuccess: () => {
        toast({
          title: "Profile updated",
          description: "Your profile has been saved.",
        })
        setIsEditOpen(false)
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update profile.",
          variant: "destructive",
        })
      },
    })
  }

  const handleChangePassword = (payload) => {
    changePassword(payload, {
      onSuccess: () => {
        toast({
          title: "Password changed",
          description: "Your password has been updated successfully.",
        })
        setIsPasswordOpen(false)
      },
      onError: () => {
        toast({
          title: "Error",
          description:
            "Failed to change password. Check your current password.",
          variant: "destructive",
        })
      },
    })
  }

  // ── Settings state ─────────────────────────────────────────────────────────
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    leaveUpdates: true,
    projectUpdates: true,
    attendanceReminders: false,
    weeklyDigest: true,
  })
  const [teams, setTeams] = useState(INITIAL_TEAMS)
  const [selectedTeamId, setSelectedTeamId] = useState(INITIAL_TEAM_ID)
  const [teamDraft, setTeamDraft] = useState(EMPTY_TEAM_DRAFT)

  const currentLanguage = i18n.language?.startsWith("hi") ? "hi" : "en"
  const isAdmin = employeeRole === "admin" || userRole === "admin"

  const { data: employeesData } = useFetchEmployees({ enabled: isAdmin })
  const employees = employeesData?.employees ?? []

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    toast({
      title: t("Theme updated"),
      description: `Theme set to ${newTheme}.`,
    })
  }

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang)
    toast({
      title: t("Language updated"),
      description: `Language set to ${lang === "en" ? "English" : "Hindi"}.`,
    })
  }

  const handleNotificationToggle = (key) => {
    setNotifications((previous) => {
      const updated = { ...previous, [key]: !previous[key] }
      toast({
        title: "Notification settings updated",
        description: `${key} has been ${updated[key] ? "enabled" : "disabled"}.`,
      })
      return updated
    })
  }

  const handleTeamDraftChange = (field, value) => {
    setTeamDraft((previous) => ({ ...previous, [field]: value }))
  }

  const handleToggleTeamMember = (memberId) => {
    setTeamDraft((previous) => {
      const exists = previous.memberIds.includes(memberId)
      return {
        ...previous,
        memberIds: exists
          ? previous.memberIds.filter((currentId) => currentId !== memberId)
          : [...previous.memberIds, memberId],
      }
    })
  }

  const handleCreateTeam = () => {
    const normalizedName = teamDraft.name.trim()
    if (!normalizedName) {
      toast({
        title: "Team name required",
        description: "Please enter a valid team name.",
        variant: "destructive",
      })
      return
    }

    const newTeamId = createTeamId(normalizedName)
    const existingTeam = teams.some((team) => team.id === newTeamId)
    if (existingTeam) {
      toast({
        title: "Team already exists",
        description: "Use a different team name.",
        variant: "destructive",
      })
      return
    }

    const nextTeam = {
      id: newTeamId,
      name: normalizedName,
      leadId: teamDraft.leadId,
      memberIds: teamDraft.memberIds,
      responsibilities: getDefaultResponsibilities(),
    }

    setTeams((previous) => [...previous, nextTeam])
    setSelectedTeamId(newTeamId)
    setTeamDraft(EMPTY_TEAM_DRAFT)

    toast({
      title: "Team created",
      description: `${normalizedName} is ready for responsibility assignments.`,
    })
  }

  const handleTeamResponsibilityChange = (teamId, moduleKey, value) => {
    setTeams((previous) =>
      previous.map((team) => {
        if (team.id !== teamId) return team
        return {
          ...team,
          responsibilities: {
            ...team.responsibilities,
            [moduleKey]: value,
          },
        }
      }),
    )
  }

  const handleSaveRoles = () => {
    const selectedTeam = teams.find((team) => team.id === selectedTeamId)
    toast({
      title: "Roles updated",
      description: `${selectedTeam?.name ?? "Selected team"} responsibilities have been saved.`,
    })
  }

  return (
    <ProfileUI
      profile={profile}
      userName={userName}
      userRole={userRole}
      isLoading={isLoading}
      isError={isError}
      isEditOpen={isEditOpen}
      isPasswordOpen={isPasswordOpen}
      isUpdating={isUpdating}
      isChangingPassword={isChangingPassword}
      onOpenEdit={() => setIsEditOpen(true)}
      onCloseEdit={() => setIsEditOpen(false)}
      onOpenPassword={() => setIsPasswordOpen(true)}
      onClosePassword={() => setIsPasswordOpen(false)}
      onUpdateProfile={handleUpdateProfile}
      onChangePassword={handleChangePassword}
      theme={theme}
      currentLanguage={currentLanguage}
      notifications={notifications}
      isAdmin={isAdmin}
      teams={teams}
      selectedTeamId={selectedTeamId}
      teamDraft={teamDraft}
      employees={employees}
      onThemeChange={handleThemeChange}
      onLanguageChange={handleLanguageChange}
      onNotificationToggle={handleNotificationToggle}
      onTeamSelect={setSelectedTeamId}
      onTeamDraftChange={handleTeamDraftChange}
      onToggleTeamMember={handleToggleTeamMember}
      onCreateTeam={handleCreateTeam}
      onTeamResponsibilityChange={handleTeamResponsibilityChange}
      onSaveRoles={handleSaveRoles}
    />
  )
}

export default ProfilePage
