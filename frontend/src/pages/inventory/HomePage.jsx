import GuestLanding from './GuestLanding'
import MemberHome from './MemberHome'

// The inventory module has ONE home page at /inventory.
// Visitors who haven't joined see the landing/marketing view with join CTAs;
// logged-in members see their personal makerspace home.
export default function HomePage({
  user, items, users, borrows, notifications,
  filaments, setRequests, setPage, showToast,
  onEnter, onBrowse,
}) {
  if (!user) {
    return <GuestLanding onEnter={onEnter} onBrowse={onBrowse} items={items} users={users} borrows={borrows} />
  }
  return (
    <MemberHome
      user={user} items={items} borrows={borrows} notifications={notifications}
      setPage={setPage} filaments={filaments} setRequests={setRequests} showToast={showToast}
    />
  )
}
