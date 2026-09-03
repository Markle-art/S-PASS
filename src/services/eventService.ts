import { catalog, type CatalogEvent } from '../data/catalog';
import { supabase, isSupabaseConfigured } from './supabase';

export interface AppEvent extends CatalogEvent {
  onchainId?: number;
  organizerAddress?: string;
  totalStaked?: string;
  noShowPool?: string;
  isActive?: boolean;
  closed?: boolean;
}

export interface EventTicket {
  id: string;
  eventId: number;
  eventTitle: string;
  attendeeAddress: string;
  depositAmount: string;
  location: string;
  date: string;
  image: string;
  status: 'staked' | 'checked_in' | 'no_show';
  txHash?: string;
  checkedInAt?: string;
  createdAt: string;
}

export interface ProtocolStats {
  totalValueStakedAvax: number;
  totalEvents: number;
  verifiedAttendeesCount: number;
  spassRewardsDistributed: number;
  attendanceRate: number;
}

const CUSTOM_EVENTS_KEY = 'stakepass.custom_events';
const TICKETS_KEY = 'stakepass.tickets';
const DEMO_SPASS_KEY = 'stakepass.demo_spass';

// Seed demo tickets for demonstration realism
const INITIAL_DEMO_TICKETS: EventTicket[] = [
  {
    id: 'TKT-AVAX-8821',
    eventId: 1,
    eventTitle: 'AVALANCHE SUMMIT 2025',
    attendeeAddress: '0x8D0f9E8C7e9421A9fA7a9B83803B462C23622A91',
    depositAmount: '0.1 AVAX',
    location: 'Miami, FL',
    date: 'Jul 18 - 20',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&h=800&auto=format&fit=crop',
    status: 'checked_in',
    checkedInAt: '2026-07-18T10:15:00Z',
    createdAt: '2026-07-01T14:20:00Z',
  },
  {
    id: 'TKT-RAVE-4490',
    eventId: 2,
    eventTitle: 'NEON UNDERGROUND RAVE',
    attendeeAddress: '0x1A3c7546875b24479E4B65B1C289547d2f939F40',
    depositAmount: '0.2 AVAX',
    location: 'Brooklyn, NY',
    date: 'Aug 02',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&h=800&auto=format&fit=crop',
    status: 'staked',
    createdAt: '2026-07-20T09:00:00Z',
  },
];

export function getStoredEvents(): AppEvent[] {
  try {
    const raw = localStorage.getItem(CUSTOM_EVENTS_KEY);
    if (raw) {
      const custom: AppEvent[] = JSON.parse(raw);
      return [...custom, ...catalog];
    }
  } catch (err) {
    console.error('Failed to parse stored events', err);
  }
  return catalog;
}

export function saveNewEvent(newEvent: AppEvent): void {
  try {
    const raw = localStorage.getItem(CUSTOM_EVENTS_KEY);
    const list: AppEvent[] = raw ? JSON.parse(raw) : [];
    list.unshift(newEvent);
    localStorage.setItem(CUSTOM_EVENTS_KEY, JSON.stringify(list));

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('events')
        .insert([
          {
            title: newEvent.title,
            description: newEvent.description,
            organizer: newEvent.organizer,
            organizer_address: newEvent.organizerAddress,
            date: newEvent.date,
            location: newEvent.location,
            price: newEvent.price,
            capacity: newEvent.capacity,
            sold: newEvent.sold,
            category: newEvent.category,
            image: newEvent.image,
            gradient: newEvent.gradient,
            onchain_id: newEvent.onchainId,
          },
        ])
        .then(({ error }) => {
          if (error) console.warn('Supabase event sync error:', error);
        });
    }
  } catch (err) {
    console.error('Failed to save new event', err);
  }
}

export function getStoredTickets(): EventTicket[] {
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    if (!raw) {
      localStorage.setItem(TICKETS_KEY, JSON.stringify(INITIAL_DEMO_TICKETS));
      return INITIAL_DEMO_TICKETS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load tickets', err);
    return INITIAL_DEMO_TICKETS;
  }
}

export function getUserTickets(address: string): EventTicket[] {
  if (!address) return [];
  const tickets = getStoredTickets();
  const lower = address.toLowerCase();
  return tickets.filter((t) => t.attendeeAddress.toLowerCase() === lower);
}

export function createTicket(
  event: AppEvent,
  attendeeAddress: string,
  txHash?: string
): EventTicket {
  const tickets = getStoredTickets();
  const newTicket: EventTicket = {
    id: `TKT-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${event.id}`,
    eventId: event.id,
    eventTitle: event.title,
    attendeeAddress,
    depositAmount: event.price,
    location: event.location,
    date: event.date,
    image: event.image,
    status: 'staked',
    txHash,
    createdAt: new Date().toISOString(),
  };

  tickets.unshift(newTicket);
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));

  if (isSupabaseConfigured && supabase) {
    supabase
      .from('tickets')
      .insert([
        {
          id: newTicket.id,
          event_id: newTicket.eventId,
          attendee_address: newTicket.attendeeAddress,
          deposit_amount: newTicket.depositAmount,
          status: newTicket.status,
          tx_hash: newTicket.txHash,
        },
      ])
      .then(({ error }) => {
        if (error) console.warn('Supabase ticket insert error:', error);
      });
  }

  return newTicket;
}

export function checkInTicket(ticketIdOrAttendee: string, eventId?: number): boolean {
  const tickets = getStoredTickets();
  const target = tickets.find((t) => {
    if (t.id.toLowerCase() === ticketIdOrAttendee.toLowerCase()) return true;
    if (
      eventId !== undefined &&
      t.eventId === eventId &&
      t.attendeeAddress.toLowerCase() === ticketIdOrAttendee.toLowerCase()
    ) {
      return true;
    }
    return false;
  });

  if (!target) return false;
  target.status = 'checked_in';
  target.checkedInAt = new Date().toISOString();
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));

  if (isSupabaseConfigured && supabase) {
    supabase
      .from('tickets')
      .update({ status: 'checked_in', checked_in_at: target.checkedInAt })
      .eq('id', target.id)
      .then(({ error }) => {
        if (error) console.warn('Supabase ticket checkin update error:', error);
      });
  }

  return true;
}

export function getEventAttendees(eventId: number): { address: string; status: 'Verified' | 'Pending'; ticketId: string }[] {
  const tickets = getStoredTickets().filter((t) => t.eventId === eventId);
  return tickets.map((t) => ({
    address: t.attendeeAddress,
    status: t.status === 'checked_in' ? 'Verified' : 'Pending',
    ticketId: t.id,
  }));
}

export function getProtocolStats(): ProtocolStats {
  const events = getStoredEvents();
  const tickets = getStoredTickets();
  const verified = tickets.filter((t) => t.status === 'checked_in').length;

  let totalAvax = 0;
  for (const e of events) {
    const num = parseFloat(e.price.replace(/[^0-9.]/g, '')) || 0.1;
    totalAvax += num * (e.sold || 45);
  }

  return {
    totalValueStakedAvax: parseFloat(totalAvax.toFixed(2)),
    totalEvents: events.length,
    verifiedAttendeesCount: verified + 412,
    spassRewardsDistributed: verified * 50 + 12500,
    attendanceRate: 96.4,
  };
}

export function getDemoSpassBalance(address: string): number {
  if (!address) return 0;
  try {
    const key = `${DEMO_SPASS_KEY}_${address.toLowerCase()}`;
    const val = localStorage.getItem(key);
    return val ? parseFloat(val) : 0;
  } catch {
    return 0;
  }
}

export function addDemoSpass(address: string, amount: number): number {
  if (!address) return 0;
  const key = `${DEMO_SPASS_KEY}_${address.toLowerCase()}`;
  const current = getDemoSpassBalance(address);
  const next = current + amount;
  localStorage.setItem(key, next.toString());
  return next;
}
