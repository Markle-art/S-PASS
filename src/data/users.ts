export type Role = 'attendee' | 'organizer' | 'sponsor';

export interface AuthUser {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export interface PlaceholderAccount {
  email: string;
  password: string;
  name: string;
  role: Role;
  label: string;
}

export const placeholderAccounts: PlaceholderAccount[] = [
  {
    email: 'user@stakepass.io',
    password: 'userpass',
    name: 'Alex Attendee',
    role: 'attendee',
    label: 'Normal User',
  },
  {
    email: 'organizer@stakepass.io',
    password: 'organizerpass',
    name: 'Riley Organizer',
    role: 'organizer',
    label: 'Event Organizer',
  },
  {
    email: 'sponsor@stakepass.io',
    password: 'sponsorpass',
    name: 'Sam Sponsor',
    role: 'sponsor',
    label: 'Sponsor',
  },
];

export const roleLabel: Record<Role, string> = {
  attendee: 'Attendee',
  organizer: 'Event Organizer',
  sponsor: 'Sponsor',
};
