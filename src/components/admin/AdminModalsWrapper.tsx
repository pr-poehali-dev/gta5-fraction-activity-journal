import { User, FactionMember, Warning, Faction } from '../types'
import AddMemberModal from '../AddMemberModal'
import WarningModal from '../WarningModal'
import UserManagementModal from '../UserManagementModal'
import AddFactionModal from '../AddFactionModal'
import FactionManagementModal from '../FactionManagementModal'
import ActivityLogModal from '../ActivityLogModal'

interface AdminModalsWrapperProps {
  showAddMemberModal: boolean
  showWarningModal: boolean
  showUserManagementModal: boolean
  showAddFactionModal: boolean
  showFactionManagementModal: boolean
  showActivityLogModal: boolean
  onCloseAddMemberModal: () => void
  onCloseWarningModal: () => void
  onCloseUserManagementModal: () => void
  onCloseAddFactionModal: () => void
  onCloseFactionManagementModal: () => void
  onCloseActivityLogModal: () => void
  selectedMember: FactionMember | null
  currentUser: User
  factions: Faction[]
  onAddMember: (newMember: Omit<FactionMember, 'id'> & { factionId: number }) => FactionMember
  onAddWarning: (memberId: number, warning: Omit<Warning, 'id' | 'timestamp'>) => void
  onRemoveWarning: (memberId: number, warningId: string) => void
  onAddFaction: (factionData: Omit<Faction, 'id' | 'members' | 'totalMembers' | 'onlineMembers'>) => Faction
}

export default function AdminModalsWrapper({
  showAddMemberModal,
  showWarningModal,
  showUserManagementModal,
  showAddFactionModal,
  showFactionManagementModal,
  showActivityLogModal,
  onCloseAddMemberModal,
  onCloseWarningModal,
  onCloseUserManagementModal,
  onCloseAddFactionModal,
  onCloseFactionManagementModal,
  onCloseActivityLogModal,
  selectedMember,
  currentUser,
  factions,
  onAddMember,
  onAddWarning,
  onRemoveWarning,
  onAddFaction
}: AdminModalsWrapperProps) {
  return (
    <>
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={onCloseAddMemberModal}
        onAddMember={onAddMember}
        factions={factions}
      />

      <WarningModal
        isOpen={showWarningModal}
        onClose={onCloseWarningModal}
        member={selectedMember}
        currentUser={currentUser}
        onAddWarning={onAddWarning}
        onRemoveWarning={onRemoveWarning}
      />

      <UserManagementModal
        isOpen={showUserManagementModal}
        onClose={onCloseUserManagementModal}
        currentUser={currentUser}
      />

      <AddFactionModal
        isOpen={showAddFactionModal}
        onClose={onCloseAddFactionModal}
        onAddFaction={onAddFaction}
      />

      <FactionManagementModal
        isOpen={showFactionManagementModal}
        onClose={onCloseFactionManagementModal}
        currentUser={currentUser}
      />

      <ActivityLogModal
        isOpen={showActivityLogModal}
        onClose={onCloseActivityLogModal}
        currentUser={currentUser}
      />
    </>
  )
}