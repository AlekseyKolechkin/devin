export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  avatar: string;
  joinedDate: string;
  department: string;
}

export interface UserListProps {
  users?: User[];
  loading?: boolean;
  error?: string;
  onSearch?: (query: string) => void;
}

export interface SearchState {
  query: string;
  filteredUsers: User[];
}
