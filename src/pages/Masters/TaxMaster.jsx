
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./TaxMaster.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { addTaxAPI, deleteTaxAPI, getTaxAPI, updateTaxAPI } from "../../services/allAPIs";

const TaxMaster = () => {
  const [taxes, setTaxes] = useState([]);
  const [taxId, setTaxId] = useState("");
  const [taxName, setTaxName] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);
  const [userData, setUserData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const getAllTaxes = async () => {
    try {
      const response = await getTaxAPI();
      console.log("Fetched Taxes:", response.data);
      setTaxes(response.data.data);
    } catch (error) {
      console.error("Error fetching taxes:", error);
    }
  };

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem("data"));
    setUserData(data);
    getAllTaxes();
  }, []);

  const generateTaxId = () => {
    const highestTaxId = taxes.reduce((max, tax) => {
      const number = parseInt(tax.taxId.replace("TAX", ""), 10);
      return Math.max(max, number);
    }, 0);

    return "TAX" + String(highestTaxId + 1).padStart(3, "0");
  };

  const nextTaxId = generateTaxId();

  // Save or update tax
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedId = taxId.trim();
    const trimmedName = taxName.trim();
    const rate = Number(taxRate);

    if (!nextTaxId || !trimmedName || taxRate === "") {
      toast.error("Please fill all required fields");
      return;
    }

    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      toast.error("Tax rate must be between 0 and 100");
      return;
    }

    // Check duplicate Tax ID
    const duplicate = taxes.some(
      (tax) =>
        tax.taxId.toLowerCase() === trimmedId.toLowerCase() &&
        tax._id !== editId
    );

    if (duplicate) {
      toast.error("Tax ID already exists");
      return;
    }

    if (editId !== null) {
      try {
        console.log("Edited id", editId);
        const updatedTaxResponse = await updateTaxAPI(
          {
            taxName: trimmedName,
            taxRate: rate,
            addedBy: userData.existingUser.name,
            addedById: userData.existingUser._id
          },
          editId
        );
        if (updatedTaxResponse.status === 200) {
          toast.success("Tax updated successfully");
          getAllTaxes();
        }
      } catch (error) {
        console.error("Error updating tax:", error);
        toast.error("Error updating tax");
      }
    } else {
      const newTax = {
        taxId: nextTaxId,
        taxName: trimmedName,
        taxRate: rate,
        addedBy: userData.existingUser.name,
        addedById: userData.existingUser._id
      };

      try {
        const addedTaxResponse = await addTaxAPI(newTax);
        if (addedTaxResponse.status === 201) {
          toast.success("Tax added successfully");
          getAllTaxes();
        }
      }
      catch (error) {
        console.error(
          "Tax API Error:",
          error.response?.data || error
        );

        toast.error(
          error.response?.data?.error || "Error adding tax"
        );
        toast.error("Error adding tax");
      }
    }

    handleCancel();
  };

  // Edit tax
  const handleEdit = (tax) => {
    console.log("Editing tax:", tax);
    setTaxId(tax.taxId);
    setTaxName(tax.taxName);
    setTaxRate(String(tax.taxRate));
    setEditId(tax._id);
  };

  // Reset form
  const handleCancel = () => {
    setTaxId("");
    setTaxName("");
    setTaxRate("");
    setEditId(null);
  };

  // Search
  const filteredTaxes = taxes.filter((tax) =>
    tax.taxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tax.taxName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    try {
      const deleteResponse = await deleteTaxAPI(id);
      if (deleteResponse.status === 200) {
        toast.success("Tax deleted successfully");
        getAllTaxes();
      }
    } catch (error) {
      console.error("Error deleting tax:", error);
      toast.error("Error deleting tax");
    }
  };

  // Pagination
  const totalPages = Math.ceil(
    filteredTaxes.length / recordsPerPage
  );

  const indexOfLastRecord = currentPage * recordsPerPage;

  const indexOfFirstRecord =
    indexOfLastRecord - recordsPerPage;

  const currentTaxes = filteredTaxes.slice(
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
      <div className="tax-master-page">

        <div className="tax-page-heading">
          <div>
            <h3>Tax Master</h3>
            <p>Manage tax names, IDs and applicable tax rates</p>
          </div>
          <span className="tax-heading-icon">
            <i className="bi bi-percent"></i>
          </span>
        </div>

        {/* Tax Form */}
        <div className="tax-form-card">
          <div className="tax-card-heading">
            <h5>
              {editId !== null ? "Edit Tax Details" : "Add Tax Details"}
            </h5>
            <p>Enter the tax information below</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row align-items-end">

              <div className="col-md-4 mb-3">
                <label className="form-label">
                  Tax ID <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  className="form-control group-code-input"
                  value={
                    editId !== null
                      ? taxes.find((tax) => tax._id === editId)?.taxId || ""
                      : nextTaxId
                  }
                  readOnly
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">
                  Tax Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter tax name"
                  value={taxName}
                  onChange={(e) => setTaxName(e.target.value)}
                  maxLength={50}
                />
              </div>

              <div className="col-md-2 mb-3">
                <label className="form-label">
                  Tax Rate (%) <span className="required-star">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="0.00"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <div className="col-md-2 mb-3">
                <div className="tax-form-actions">
                  <button type="submit" className="btn tax-save-btn">
                    <i className={`bi ${editId !== null
                      ? "bi-check-lg"
                      : "bi-plus-lg"
                      } me-2`}></i>
                    {editId !== null ? "Update" : "Save"}
                  </button>

                  {editId !== null && (
                    <button
                      type="button"
                      className="btn tax-cancel-btn"
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

        {/* Tax List */}
        <div className="tax-table-card">

          <div className="tax-table-header">
            <div>
              <h5>Tax List</h5>
              <p>{taxes.length} tax record(s) added</p>
            </div>

            <div className="tax-search">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search tax..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table tax-table align-middle">
              <thead>
                <tr>
                  <th>Sl. No.</th>
                  <th>Tax ID</th>
                  <th>Tax Name</th>
                  <th>Tax Rate (%)</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentTaxes.length > 0 ? (
                  currentTaxes.map((tax, index) => (
                    <tr key={tax._id}>
                      <td>{indexOfFirstRecord + index + 1}</td>

                      <td>
                        <span className="tax-id-badge">
                          {tax.taxId}
                        </span>
                      </td>

                      <td className="tax-name-cell">
                        {tax.taxName}
                      </td>

                      <td>
                        <span className="tax-rate-badge">
                          {tax.taxRate}%
                        </span>
                      </td>

                      <td>
                        <div className="tax-action-buttons">
                          <button
                            type="button"
                            className="tax-edit-btn"
                            onClick={() => handleEdit(tax)}
                            title="Edit"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>

                          <button
                            type="button"
                            className="tax-delete-btn"
                            onClick={() => handleDelete(tax._id)}
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr key="empty-tax-row">
                    <td colSpan="5" className="tax-empty-state">
                      <i className="bi bi-inbox"></i>

                      <p>
                        {searchTerm
                          ? "No matching tax records found"
                          : "No tax records added yet"}
                      </p>

                      <small>
                        Add your first tax using the form above.
                      </small>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {filteredTaxes.length > 0 && (
              <div className="tax-pagination">

                <span className="tax-pagination-info">
                  Showing {indexOfFirstRecord + 1} to{" "}
                  {Math.min(indexOfLastRecord, filteredTaxes.length)}{" "}
                  of {filteredTaxes.length} tax records
                </span>

                <div className="tax-pagination-buttons">

                  {/* Previous */}
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>

                  {/* Page numbers */}
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      type="button"
                      key={page}
                      className={currentPage === page ? "active" : ""}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next */}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>

                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default TaxMaster;
