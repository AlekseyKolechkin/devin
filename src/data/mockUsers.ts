import { User } from '../types/user';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.johnson@company.com',
    role: 'Frontend Developer',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    joinedDate: '2023-01-15',
    department: 'Engineering'
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob.smith@company.com',
    role: 'Backend Developer',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    joinedDate: '2022-11-20',
    department: 'Engineering'
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol.davis@company.com',
    role: 'Product Manager',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    joinedDate: '2023-03-10',
    department: 'Product'
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david.wilson@company.com',
    role: 'UX Designer',
    status: 'inactive',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    joinedDate: '2022-08-05',
    department: 'Design'
  },
  {
    id: '5',
    name: 'Emma Brown',
    email: 'emma.brown@company.com',
    role: 'DevOps Engineer',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    joinedDate: '2023-05-22',
    department: 'Engineering'
  },
  {
    id: '6',
    name: 'Frank Miller',
    email: 'frank.miller@company.com',
    role: 'QA Engineer',
    status: 'pending',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    joinedDate: '2023-07-01',
    department: 'Engineering'
  },
  {
    id: '7',
    name: 'Grace Lee',
    email: 'grace.lee@company.com',
    role: 'Marketing Manager',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    joinedDate: '2022-12-15',
    department: 'Marketing'
  },
  {
    id: '8',
    name: 'Henry Taylor',
    email: 'henry.taylor@company.com',
    role: 'Sales Representative',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face',
    joinedDate: '2023-02-28',
    department: 'Sales'
  },
  {
    id: '9',
    name: 'Ivy Chen',
    email: 'ivy.chen@company.com',
    role: 'Data Scientist',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    joinedDate: '2023-04-12',
    department: 'Data'
  },
  {
    id: '10',
    name: 'Jack Anderson',
    email: 'jack.anderson@company.com',
    role: 'HR Manager',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    joinedDate: '2022-09-18',
    department: 'Human Resources'
  }
];

export const fetchUsers = async (): Promise<User[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (Math.random() < 0.1) {
    throw new Error('Failed to fetch users');
  }
  
  return mockUsers;
};
