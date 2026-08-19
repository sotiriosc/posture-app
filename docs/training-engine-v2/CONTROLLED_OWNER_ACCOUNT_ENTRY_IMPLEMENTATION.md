# Controlled Owner Account Entry Implementation

The current Account settings page is unchanged. A server layout returns the original child tree directly when
mode is off or identity is ineligible. After passive server eligibility succeeds, it appends exactly one link,
`Praxis V2 owner preview`, targeting `/account/praxis-v2`.

There is no client eligibility request, loading flash, email, hidden owner HTML, or identity-bearing response
header. Middleware remains unchanged because `/account/:path*` already has the required authentication gate.
