"use client";

import { useEffect, useState, useMemo } from "react";
import { User, Shield, Trash2, Edit, Search, ArrowUpDown, ArrowUp, ArrowDown, ArrowUpCircle, Users, FileSpreadsheet } from "lucide-react";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import BulkPromotionModal from "./BulkPromotionModal";
import BulkAssignModal from "./BulkAssignModal";
import ImportUserModal from "./ImportUserModal";
import { getAuth } from "@/utils/auth";

interface Role {
    id: number;
    name: string;
}

interface ClassRoom {
    id: number;
    name: string;
}

interface TahunAjaran {
    id: number;
    tahun: string;
    is_active: boolean;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    role: Role;
    role_id: number;
    class_room?: ClassRoom;
    tahun_ajaran?: TahunAjaran;
    nisn?: string;
    nomor_hp?: string;
    created_at: string;
}

export default function UserList() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    // Search, Filter, and Sort states
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [filterClass, setFilterClass] = useState("");
    const [filterAcademicYear, setFilterAcademicYear] = useState("");
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'class' | 'academic_year'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [isBulkPromotionModalOpen, setIsBulkPromotionModalOpen] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const { token } = getAuth();
            console.log("Fetching users with token:", token);
            const res = await fetch("/api/users", {
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            console.log("Fetch users response status:", res.status);

            if (res.ok) {
                const data = await res.json();
                console.log("Fetch users data:", data);
                setUsers(data);
            } else {
                console.error("Fetch users failed:", await res.text());
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const { token } = getAuth();
            const res = await fetch("/api/class-rooms", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) setClasses(await res.json());
        } catch (err) {
            console.error("Failed to fetch classes", err);
        }
    };

    const fetchAcademicYears = async () => {
        try {
            const { token } = getAuth();
            const res = await fetch("/api/tahun-ajaran", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) setAcademicYears(await res.json());
        } catch (err) {
            console.error("Failed to fetch academic years", err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchClasses();
        fetchAcademicYears();
    }, []);

    // Filtered and sorted users
    const filteredAndSortedUsers = useMemo(() => {
        let filtered = users.filter(user => {
            // Search by name or email
            const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());

            // Filter by role
            const matchesRole = !filterRole || user.role_id.toString() === filterRole;

            // Filter by class
            const matchesClass = !filterClass || user.class_room?.id.toString() === filterClass;

            // Filter by academic year
            const matchesAcademicYear = !filterAcademicYear || user.tahun_ajaran?.id.toString() === filterAcademicYear;

            return matchesSearch && matchesRole && matchesClass && matchesAcademicYear;
        });

        // Sort
        return filtered.sort((a, b) => {
            let aValue: string, bValue: string;

            switch (sortBy) {
                case 'name':
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case 'email':
                    aValue = a.email;
                    bValue = b.email;
                    break;
                case 'role':
                    aValue = a.role.name;
                    bValue = b.role.name;
                    break;
                case 'class':
                    aValue = a.class_room?.name || '';
                    bValue = b.class_room?.name || '';
                    break;
                case 'academic_year':
                    aValue = a.tahun_ajaran?.tahun || '';
                    bValue = b.tahun_ajaran?.tahun || '';
                    break;
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }, [users, searchQuery, filterRole, filterClass, filterAcademicYear, sortBy, sortDirection]);

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) return;

        try {
            const { token } = getAuth();
            const res = await fetch(`/api/users/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                fetchUsers();
            } else {
                alert("Gagal menghapus user");
            }
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    const handleEdit = (user: UserData) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleSort = (column: 'name' | 'email' | 'role' | 'class' | 'academic_year') => {
        if (sortBy === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    const SortIcon = ({ column }: { column: typeof sortBy }) => {
        if (sortBy !== column) return <ArrowUpDown className="h-4 w-4 text-slate-400" />;
        return sortDirection === 'asc' ?
            <ArrowUp className="h-4 w-4 text-primary" /> :
            <ArrowDown className="h-4 w-4 text-primary" />;
    };

    // Checkbox selection handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUserIds(filteredAndSortedUsers.map(u => u.id));
        } else {
            setSelectedUserIds([]);
        }
    };

    const handleSelectUser = (userId: number, checked: boolean) => {
        if (checked) {
            setSelectedUserIds([...selectedUserIds, userId]);
        } else {
            setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
        }
    };


    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-slate-900">
                        Manajemen User
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        Daftar pengguna terdaftar di sistem.
                    </p>
                </div>
                <div className="flex gap-2">
                    {selectedUserIds.length > 0 && (
                        <button
                            onClick={() => setIsBulkAssignModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-primary text-sm font-medium rounded-md text-primary bg-blue-50 hover:bg-blue-100"
                        >
                            <Users className="mr-2 h-4 w-4" />
                            Pindahkan {selectedUserIds.length} Siswa
                        </button>
                    )}
                    <button
                        onClick={() => setIsBulkPromotionModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
                    >
                        <ArrowUpCircle className="mr-2 h-4 w-4" />
                        Kenaikan Kelas
                    </button>
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 relative"
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                        Import Excel
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none"
                    >
                        Tambah User
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-3 border-b border-slate-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari user berdasarkan nama atau email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap gap-3">
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                    <option value="">Semua Role</option>
                    <option value="1">Admin</option>
                    <option value="2">User</option>
                </select>

                <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                    <option value="">Semua Kelas</option>
                    {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                <select
                    value={filterAcademicYear}
                    onChange={(e) => setFilterAcademicYear(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                    <option value="">Semua Tahun Pelajaran</option>
                    {academicYears.map(y => (
                        <option key={y.id} value={y.id}>{y.tahun}</option>
                    ))}
                </select>

                {(searchQuery || filterRole || filterClass || filterAcademicYear) && (
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setFilterRole("");
                            setFilterClass("");
                            setFilterAcademicYear("");
                        }}
                        className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 underline"
                    >
                        Reset Filter
                    </button>
                )}
            </div>

            <div className="border-t border-slate-200">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Memuat data...</div>
                ) : (
                    <>
                        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                            Menampilkan {filteredAndSortedUsers.length} dari {users.length} user
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedUserIds.length === filteredAndSortedUsers.length && filteredAndSortedUsers.length > 0}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                                            />
                                        </th>
                                        <th
                                            onClick={() => handleSort('name')}
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                                        >
                                            <div className="flex items-center gap-2">
                                                Nama
                                                <SortIcon column="name" />
                                            </div>
                                        </th>
                                        <th
                                            onClick={() => handleSort('role')}
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                                        >
                                            <div className="flex items-center gap-2">
                                                Role
                                                <SortIcon column="role" />
                                            </div>
                                        </th>
                                        <th
                                            onClick={() => handleSort('class')}
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                                        >
                                            <div className="flex items-center gap-2">
                                                Kelas
                                                <SortIcon column="class" />
                                            </div>
                                        </th>
                                        <th
                                            onClick={() => handleSort('academic_year')}
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                                        >
                                            <div className="flex items-center gap-2">
                                                Tahun Pelajaran
                                                <SortIcon column="academic_year" />
                                            </div>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Tanggal Gabung
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {filteredAndSortedUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUserIds.includes(user.id)}
                                                    onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                                                    className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                                            <User className="h-6 w-6" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                                        <div className="text-sm text-slate-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role?.name === 'admin' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                                    {user.role?.name || 'User'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {user.class_room?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {user.tahun_ajaran?.tahun || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {new Date(user.created_at).toLocaleDateString("id-ID")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEdit(user)} className="text-primary hover:text-blue-900 mr-4">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            <AddUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchUsers}
            />

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchUsers}
                user={selectedUser}
                classes={classes}
                academicYears={academicYears}
            />

            <BulkPromotionModal
                isOpen={isBulkPromotionModalOpen}
                onClose={() => setIsBulkPromotionModalOpen(false)}
                onSuccess={fetchUsers}
                classes={classes}
                academicYears={academicYears}
            />

            <BulkAssignModal
                isOpen={isBulkAssignModalOpen}
                onClose={() => setIsBulkAssignModalOpen(false)}
                onSuccess={() => {
                    fetchUsers();
                    setSelectedUserIds([]);
                    setIsBulkAssignModalOpen(false);
                }}
                selectedUsers={filteredAndSortedUsers.filter(u => selectedUserIds.includes(u.id))}
                classes={classes}
                academicYears={academicYears}
            />

            <ImportUserModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={fetchUsers}
            />
        </div>
    );
}
