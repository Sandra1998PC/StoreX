
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./GroupProductMaster.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { addProductGroupAPI, deleteProductGroupAPI, getProductGroupAPI, updateProductGroupAPI } from "../../services/allAPIs";
import Swal from "sweetalert2";

const GroupProductMaster = () => {
    const [groups, setGroups] = useState([]);
    const [groupName, setGroupName] = useState("");
    const [groupLength, setGroupLength] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [editId, setEditId] = useState(null);
    const [userData, setUserData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchGroups = async () => {
        try {
            const response = await getProductGroupAPI();
            const groupsData = response.data.data || [];
            console.log("Fetched product groups:", groupsData);

            setGroups(groupsData);
            setGroupLength(groupsData.length);

        } catch (error) {
            toast.error("Failed to fetch product groups");
        }
    };

    useEffect(() => {
        const data = JSON.parse(sessionStorage.getItem("data"));
        setUserData(data);
        fetchGroups();
    }, []);

    // Generate the next group code
    const generateGroupCode = () => {
        const highestgroupId = groups.reduce((max, group) => {
            const number = parseInt(group.groupCode.replace("GP", ""), 10);
            return Math.max(max, number);
        }, 0);

        return `GP${String(highestgroupId + 1).padStart(3, "0")}`;
    };

    const nextGroupCode = generateGroupCode();

    // Save or update group
    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedName = groupName.trim();

        if (!trimmedName) {
            toast.error("Please enter a group name");
            return;
        }

        // Check duplicate group name
        const duplicate = groups.some(
            (group) =>
                group.groupName.toLowerCase() === trimmedName.toLowerCase() &&
                group._id !== editId
        );

        if (duplicate) {
            toast.error("Group name already exists");
            return;
        }

        if (editId !== null) {
            const updateGroupResponse = await updateProductGroupAPI({ groupName: trimmedName }, editId);
            if (updateGroupResponse.status === 200) {
                fetchGroups();
                toast.success("Group updated successfully");
                setEditId(null);
            }
            else {
                toast.error("Failed to update group");
            }
        } else {
            const newGroup = {
                groupCode: nextGroupCode,
                groupName: trimmedName,
                addedBy: userData.existingUser.name,
                addedById: userData.existingUser._id
            };
            debugger
            try {
                const addedResponse = await addProductGroupAPI(newGroup);
                console.log("Added product group:", addedResponse);
                if (addedResponse.status === 201) {
                    fetchGroups();
                    toast.success("Group added successfully");
                }
            } catch (error) {
                toast.error("Failed to add group");
            }

        }

        setGroupName("");
    };

    // Edit group
    const handleEdit = (group) => {
        setGroupName(group.groupName);
        setEditId(group._id);
    };

    // Delete group
    const handleDelete = async (id) => {
        const confirmDelete = await Swal.fire({
            title: "Are you sure?",
            text: "You want to delete this group?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#14532D",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });
        try {
            if (confirmDelete.isConfirmed) {
                const deleteGroupResponse = await deleteProductGroupAPI(id);
                if (deleteGroupResponse.status === 200) {
                    fetchGroups();
                    if (editId === id) {
                        setEditId(null);
                        setGroupName("");
                    }

                    toast.success("Group deleted successfully");
                }
                else {
                    toast.error("Failed to delete group");
                }
            }
        }
        catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Something went wrong while deleting the group";

            toast.error(errorMessage);
        }
    };

    // Cancel edit
    const handleCancel = () => {
        setGroupName("");
        setEditId(null);
    };

    // Search groups
    const filteredGroups = groups.filter((group) =>
        group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.groupCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const recordsPerPage = 5;
    const totalPages = Math.ceil(filteredGroups.length / recordsPerPage);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentGroups = filteredGroups.slice(
        indexOfFirstRecord,
        indexOfLastRecord
    );

    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    return (
        <>
            <Navbar />
            <div className="group-master-page">

                {/* Page Header */}
                <div className="group-page-header">
                    <div>
                        <h2>Group Product Master</h2>
                        <p>Manage and organize your product groups.</p>
                    </div>

                    <div className="group-breadcrumb">
                        Masters / <span>Group Product Master</span>
                    </div>
                </div>

                <div className="group-master-content">

                    {/* Add / Edit Form */}
                    <div className="group-form-card">

                        <div className="group-card-heading">
                            <div className="group-heading-icon">
                                <i className="bi bi-collection"></i>
                            </div>

                            <div>
                                <h5>{editId !== null ? "Edit Group" : "Add New Group"}</h5>
                                <p>
                                    {editId !== null
                                        ? "Update the selected product group."
                                        : "Enter a group name to create a new group."}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="row align-items-start">

                                {/* Group Code */}
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Group Code</label>
                                    <input
                                        type="text"
                                        className="form-control group-code-input"
                                        value={
                                            editId !== null
                                                ? groups.find((group) => group._id === editId)?.groupCode || ""
                                                : nextGroupCode
                                        }
                                        readOnly
                                    />
                                    <small className="group-help-text">
                                        Automatically generated
                                    </small>
                                </div>

                                {/* Group Name */}
                                <div className="col-md-5 mb-3">
                                    <label className="form-label">
                                        Group Name <span className="required-star">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter group name"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        maxLength={50}
                                    />
                                </div>

                                {/* Form Actions */}
                                <div className="col-md-3 mb-3">
                                    <div className="group-form-actions d-flex gap-2">
                                        <button type="submit" className={`btn ${editId !== null ? "btn-warning" : "btn-success"}`}>
                                            <i
                                                className={`bi ${editId !== null ? "bi-check-lg" : "bi-plus-lg"
                                                    } me-2`}
                                            ></i>
                                            {editId !== null ? "Update" : "Save"}
                                        </button>

                                        {editId !== null && (
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={handleCancel}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </form>
                    </div>

                    {/* Group List */}
                    <div className="group-table-card">

                        <div className="group-table-header">
                            <div>
                                <h5>Group List</h5>
                                <p>{groups.length} group(s) added</p>
                            </div>

                            <div className="group-search">
                                <i className="bi bi-search"></i>
                                <input
                                    type="text"
                                    placeholder="Search group..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table group-table align-middle">
                                <thead>
                                    <tr>
                                        <th>Sl. No.</th>
                                        <th>Group Code</th>
                                        <th>Group Name</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredGroups.length > 0 ? (
                                        currentGroups.map((group, index) => (
                                            <tr key={group._id}>
                                                <td>{indexOfFirstRecord + index + 1}</td>

                                                <td>
                                                    <span className="group-code-badge">
                                                        {group.groupCode}
                                                    </span>
                                                </td>

                                                <td className="group-name-cell">
                                                    {group.groupName}
                                                </td>

                                                <td>
                                                    <div className="group-action-buttons">
                                                        <button
                                                            type="button"
                                                            className="group-edit-btn"
                                                            onClick={() => handleEdit(group)}
                                                            title="Edit"
                                                        >
                                                            <i className="bi bi-pencil-square"></i>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="group-delete-btn"
                                                            onClick={() => handleDelete(group._id)}
                                                            title="Delete"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="group-empty-state">
                                                <i className="bi bi-inbox"></i>
                                                <p>
                                                    {searchTerm
                                                        ? "No matching groups found"
                                                        : "No groups added yet"}
                                                </p>
                                                <small>
                                                    {searchTerm
                                                        ? "Try another search term."
                                                        : "Add your first product group using the form above."}
                                                </small>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>{filteredGroups.length > 0 && (
                                <div className="group-pagination">

                                    <small className="pagination-info">
                                        Showing {indexOfFirstRecord + 1} to{" "}
                                        {Math.min(indexOfLastRecord, filteredGroups.length)} of{" "}
                                        {filteredGroups.length} groups
                                    </small>

                                    <div className="pagination-buttons">

                                        <button
                                            type="button"
                                            className="pagination-btn"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage((prev) => prev - 1)}
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>

                                        {Array.from({ length: totalPages }, (_, index) => (
                                            <button
                                                key={index + 1}
                                                type="button"
                                                className={`pagination-btn ${currentPage === index + 1 ? "active" : ""
                                                    }`}
                                                onClick={() => setCurrentPage(index + 1)}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}

                                        <button
                                            type="button"
                                            className="pagination-btn"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage((prev) => prev + 1)}
                                        >
                                            <i className="bi bi-chevron-right"></i>
                                        </button>

                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default GroupProductMaster;
