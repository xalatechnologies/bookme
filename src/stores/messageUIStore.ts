/**
 * Message UI State Management Store
 *
 * Manages UI-specific state for messaging pages.
 * Separated from business logic and data fetching.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type TMessageView = 'inbox' | 'sent' | 'archived' | 'thread';
export type TMessageSortBy = 'date' | 'sender' | 'subject' | 'unread';
export type TMessageSortOrder = 'asc' | 'desc';

interface IMessageUIState {
  // View state
  readonly view: TMessageView;
  readonly showFilters: boolean;

  // Search and filter state
  readonly searchTerm: string;
  readonly unreadFilter: boolean | null;
  readonly senderFilter: readonly string[];
  readonly dateRange: { readonly start: string | null; readonly end: string | null };

  // Sort state
  readonly sortBy: TMessageSortBy;
  readonly sortOrder: TMessageSortOrder;

  // Selection state
  readonly selectedMessageIds: readonly string[];

  // Thread state
  readonly activeThreadId: string | null;

  // Modal state
  readonly modals: {
    readonly compose: boolean;
    readonly reply: boolean;
    readonly delete: boolean;
  };
  readonly activeMessageId: string | null;

  // Actions
  readonly setView: (view: TMessageView) => void;
  readonly setShowFilters: (show: boolean) => void;
  readonly toggleFilters: () => void;

  readonly setSearchTerm: (term: string) => void;
  readonly setUnreadFilter: (unread: boolean | null) => void;
  readonly setSenderFilter: (senders: readonly string[]) => void;
  readonly toggleSenderFilter: (sender: string) => void;
  readonly setDateRange: (range: { readonly start: string | null; readonly end: string | null }) => void;

  readonly setSortBy: (sortBy: TMessageSortBy) => void;
  readonly setSortOrder: (order: TMessageSortOrder) => void;
  readonly toggleSort: (sortBy: TMessageSortBy) => void;

  readonly selectMessage: (id: string) => void;
  readonly deselectMessage: (id: string) => void;
  readonly toggleMessageSelection: (id: string) => void;
  readonly selectAllMessages: (ids: readonly string[]) => void;
  readonly clearSelection: () => void;

  readonly setActiveThreadId: (id: string | null) => void;

  readonly openModal: (modal: keyof IMessageUIState['modals'], messageId?: string) => void;
  readonly closeModal: (modal: keyof IMessageUIState['modals']) => void;
  readonly closeAllModals: () => void;
  readonly setActiveMessageId: (id: string | null) => void;

  readonly resetFilters: () => void;
  readonly resetAll: () => void;
}

const initialState = {
  view: 'inbox' as TMessageView,
  showFilters: false,
  searchTerm: '',
  unreadFilter: null as boolean | null,
  senderFilter: [] as readonly string[],
  dateRange: { start: null, end: null } as const,
  sortBy: 'date' as TMessageSortBy,
  sortOrder: 'desc' as TMessageSortOrder,
  selectedMessageIds: [] as readonly string[],
  activeThreadId: null as string | null,
  modals: {
    compose: false,
    reply: false,
    delete: false,
  } as const,
  activeMessageId: null as string | null,
};

export const useMessageUIStore = create<IMessageUIState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // View actions
        setView: (view) => set({ view }),
        setShowFilters: (showFilters) => set({ showFilters }),
        toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),

        // Search and filter actions
        setSearchTerm: (searchTerm) => set({ searchTerm }),

        setUnreadFilter: (unreadFilter) => set({ unreadFilter }),

        setSenderFilter: (senderFilter) => set({ senderFilter }),
        toggleSenderFilter: (sender) =>
          set((state) => ({
            senderFilter: state.senderFilter.includes(sender)
              ? state.senderFilter.filter((s) => s !== sender)
              : [...state.senderFilter, sender],
          })),

        setDateRange: (dateRange) => set({ dateRange }),

        // Sort actions
        setSortBy: (sortBy) => set({ sortBy }),
        setSortOrder: (sortOrder) => set({ sortOrder }),
        toggleSort: (sortBy) =>
          set((state) => ({
            sortBy,
            sortOrder: state.sortBy === sortBy && state.sortOrder === 'asc' ? 'desc' : 'asc',
          })),

        // Selection actions
        selectMessage: (id) =>
          set((state) => ({
            selectedMessageIds: [...state.selectedMessageIds, id],
          })),

        deselectMessage: (id) =>
          set((state) => ({
            selectedMessageIds: state.selectedMessageIds.filter((mId) => mId !== id),
          })),

        toggleMessageSelection: (id) =>
          set((state) => ({
            selectedMessageIds: state.selectedMessageIds.includes(id)
              ? state.selectedMessageIds.filter((mId) => mId !== id)
              : [...state.selectedMessageIds, id],
          })),

        selectAllMessages: (ids) => set({ selectedMessageIds: ids }),

        clearSelection: () => set({ selectedMessageIds: [] }),

        // Thread actions
        setActiveThreadId: (activeThreadId) => set({ activeThreadId }),

        // Modal actions
        openModal: (modal, messageId) =>
          set((state) => ({
            modals: { ...state.modals, [modal]: true },
            activeMessageId: messageId ?? state.activeMessageId,
          })),

        closeModal: (modal) =>
          set((state) => ({
            modals: { ...state.modals, [modal]: false },
          })),

        closeAllModals: () =>
          set({
            modals: {
              compose: false,
              reply: false,
              delete: false,
            },
            activeMessageId: null,
          }),

        setActiveMessageId: (activeMessageId) => set({ activeMessageId }),

        // Reset actions
        resetFilters: () =>
          set({
            searchTerm: '',
            unreadFilter: null,
            senderFilter: [],
            dateRange: { start: null, end: null },
          }),

        resetAll: () => set(initialState),
      }),
      {
        name: 'message-ui-store',
        version: 1,
      }
    ),
    { name: 'MessageUIStore' }
  )
);
