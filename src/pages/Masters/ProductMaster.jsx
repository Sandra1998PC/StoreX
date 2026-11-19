import React, { useEffect, useState } from "react";
import {
  addProductAPI,
  getProductAPI,
  updateProductAPI,
  deleteProductAPI,
  getProductGroupAPI,
  getTaxAPI,
} from "../../services/allAPIs";

import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "./ProductMaster.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const ProductMaster = () => {
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [taxes, setTaxes] = useState([]);

  const [productName, setProductName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [groupId, setGroupId] = useState("");
  const [taxId, setTaxId] = useState("");
  const [unit, setUnit] = useState("");
  const [salesRate, setSalesRate] = useState("");
  const [purchaseRate, setPurchaseRate] = useState("");

  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 5;
  const [userData, setUserData] = useState(null);

  const getAllProducts = async () => {
    try {
      const response = await getProductAPI();
      console.log("getAllProducts response:", response);
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem("data"));
    setUserData(data);
    getAllProducts();
  }, []);

  // -----------------------------
  // Generate Product Code
  // -----------------------------
  const generateProductCode = () => {
    const highestCode = products.reduce((max, product) => {
      const number = parseInt(
        product.productCode?.replace("PRD", ""),
        10
      );

      return Math.max(max, isNaN(number) ? 0 : number);
    }, 0);

    return "PRD" + String(highestCode + 1).padStart(3, "0");
  };

  const nextProductCode = generateProductCode();

  // -----------------------------
  // Fetch Groups
  // -----------------------------
  const getAllGroups = async () => {
    try {
      const response = await getProductGroupAPI();

      if (response.status === 200) {
        setGroups(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Unable to load product groups");
    }
  };

  // -----------------------------
  // Fetch Taxes
  // -----------------------------
  const getAllTaxes = async () => {
    try {
      const response = await getTaxAPI();

      if (response.status === 200) {
        setTaxes(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching taxes:", error);
      toast.error("Unable to load tax records");
    }
  };

  // -----------------------------
  // Load data on component mount
  // -----------------------------
  useEffect(() => {
    getAllProducts();
    getAllGroups();
    getAllTaxes();
  }, []);

  // -----------------------------
  // Clear Form
  // -----------------------------
  const handleCancel = () => {
    setProductName("");
    setProductCode("");
    setGroupId("");
    setTaxId("");
    setUnit("");
    setSalesRate("");
    setPurchaseRate("");
    setEditId(null);
  };

  // -----------------------------
  // Save / Update Product
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = productName.trim();

    if (!trimmedName) {
      toast.error("Please enter product name");
      return;
    }

    if (!groupId) {
      toast.error("Please select product group");
      return;
    }

    if (!taxId) {
      toast.error("Please select GST / Tax");
      return;
    }

    if (!unit) {
      toast.error("Please select unit");
      return;
    }

    if (salesRate === "" || Number(salesRate) < 0) {
      toast.error("Please enter a valid sales rate");
      return;
    }

    if (purchaseRate === "" || Number(purchaseRate) < 0) {
      toast.error("Please enter a valid purchase rate");
      return;
    }

    // Duplicate product name validation
    const duplicateName = products.some(
      (product) =>
        product.productName?.toLowerCase() ===
        trimmedName.toLowerCase() &&
        product._id !== editId
    );

    if (duplicateName) {
      toast.error("Product name already exists");
      return;
    }

    const selectedGroup = groups.find(
      (group) => group._id === groupId
    );

    const selectedTax = taxes.find(
      (tax) => tax._id === taxId
    );

    const productData = {
      productName: trimmedName,
      productCode: editId
        ? productCode
        : nextProductCode,
      groupId,
      groupName: selectedGroup?.groupName,
      taxId,
      taxName: selectedTax?.taxName,
      taxRate: selectedTax?.taxRate,
      unit,
      salesRate: Number(salesRate),
      purchaseRate: Number(purchaseRate),
    };

    // -----------------------------
    // Update existing product
    // -----------------------------
    if (editId) {
      try {
        const { productName, productCode, groupId,groupName, taxId, taxName, unit, salesRate, purchaseRate } = productData;
        const updatedResponse = await updateProductAPI(
          {
            productName, productCode, groupId,groupName, taxId, taxName, unit, salesRate, purchaseRate,
            addedBy: userData?.existingUser._id, addedByName: userData?.existingUser.name
          },
          editId
        );

        if (updatedResponse.status === 200) {
          toast.success("Product updated successfully");
          handleCancel();
          getAllProducts();
        }
      } catch (error) {
        console.error(
          "Error updating product:",
          error.response?.data || error
        );

        toast.error(
          error.response?.data?.error ||
          "Error updating product"
        );
      }
    }

    // -----------------------------
    // Add new product
    // -----------------------------
    else {
      try {

        console.log(" productData", productData);
        const { productName, productCode, groupId,groupName, taxId, taxName, unit, salesRate, purchaseRate } = productData;
        const addedResponse = await addProductAPI({
          productName, productCode, groupId,groupName, taxId,taxName, unit, salesRate, purchaseRate,
          addedBy: userData?.existingUser._id, addedByName: userData?.existingUser.name
        });

        if (addedResponse.status === 201) {
          toast.success("Product added successfully");
          handleCancel();
          getAllProducts();
        }
      } catch (error) {
        console.error(
          "Error adding product:",
          error.response?.data || error
        );

        toast.error(
          error.response?.data?.error ||
          "Error adding product"
        );
      }
    }
  };

  // -----------------------------
  // Edit Product
  // -----------------------------
  const handleEdit = (product) => {
    setEditId(product._id);

    setProductName(product.productName || "");
    setProductCode(product.productCode || "");

    setGroupId(
      product.groupId?._id ||
      product.groupId ||
      product.group?._id ||
      ""
    );

    setTaxId(
      product.taxId?._id ||
      product.taxId ||
      product.tax?._id ||
      ""
    );

    setUnit(product.unit || "");
    setSalesRate(product.salesRate ?? "");
    setPurchaseRate(product.purchaseRate ?? "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // -----------------------------
  // Delete Product
  // -----------------------------
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Product?",
      text: "Are you sure you want to delete this product?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#14532D",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteProductAPI(id);

        if (response.status === 200) {
          toast.success("Product deleted successfully");

          if (editId === id) {
            handleCancel();
          }

          getAllProducts();
        }
      } catch (error) {
        console.error(
          "Error deleting product:",
          error.response?.data || error
        );

        toast.error(
          error.response?.data?.error ||
          "Error deleting product"
        );
      }
    }
  };

  // Search
  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();

    return (
      product.productName?.toLowerCase().includes(search) ||
      product.productCode?.toLowerCase().includes(search) ||
      product.groupName?.toLowerCase().includes(search) ||
      product.taxName?.toLowerCase().includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(
    filteredProducts.length / recordsPerPage
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  const currentProducts = filteredProducts.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  // -----------------------------
  // Render
  // -----------------------------
  return (
    <>
      <Navbar />
      <div className="product-master-container">

        {/* Header */}
        <div className="product-master-header">
          <div>
            <h2>
              <i className="bi bi-box-seam me-2"></i>
              Product Master
            </h2>

            <p>
              Manage products, pricing, tax and units
            </p>
          </div>
        </div>

        {/* Product Form */}
        <div className="product-form-card">

          <h5 className="product-section-title">
            <i className="bi bi-plus-circle me-2"></i>
            {editId ? "Edit Product" : "Add Product"}
          </h5>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">

              {/* Product Name */}
              <div className="col-md-4">
                <label className="form-label">
                  Product Name <span className="required">*</span>
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter product name"
                  value={productName}
                  onChange={(e) =>
                    setProductName(e.target.value)
                  }
                />
              </div>

              {/* Product Code */}
              <div className="col-md-4">
                <label className="form-label">
                  Product Code <span className="required">*</span>
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={
                    editId ? productCode : nextProductCode
                  }
                  readOnly
                />
              </div>

              {/* Group */}
              <div className="col-md-4">
                <label className="form-label">
                  Product Group <span className="required">*</span>
                </label>

                <select
                  className="form-select"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                >
                  <option value="">Select Group</option>

                  {groups.map((group) => (
                    <option
                      key={group._id}
                      value={group._id}
                    >
                      {group.groupName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tax */}
              <div className="col-md-3">
                <label className="form-label">
                  GST Name / Tax <span className="required">*</span>
                </label>

                <select
                  className="form-select"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                >
                  <option value="">Select Tax</option>

                  {taxes.map((tax) => (
                    <option
                      key={tax._id}
                      value={tax._id}
                    >
                      {tax.taxName} ({tax.taxRate}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit */}
              <div className="col-md-3">
                <label className="form-label">
                  Unit <span className="required">*</span>
                </label>

                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />

                {/* <select
                  className="form-select"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <option value="">Select Unit</option>
                  <option value="Nos">Nos</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Kg">Kg</option>
                  <option value="Gram">Gram</option>
                  <option value="Ltr">Ltr</option>
                  <option value="Ml">Ml</option>
                  <option value="Box">Box</option>
                  <option value="Pack">Pack</option>
                  <option value="Dozen">Dozen</option>
                  <option value="Meter">Meter</option>
                  <option value="Feet">Feet</option>
                </select> */}
              </div>

              {/* Sales Rate */}
              <div className="col-md-3">
                <label className="form-label">
                  Sales Rate (₹) <span className="required">*</span>
                </label>

                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter sales rate"
                  min="0"
                  step="0.01"
                  value={salesRate}
                  onChange={(e) =>
                    setSalesRate(e.target.value)
                  }
                />
              </div>

              {/* Purchase Rate */}
              <div className="col-md-3">
                <label className="form-label">
                  Purchase Rate (₹) <span className="required">*</span>
                </label>

                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter purchase rate"
                  min="0"
                  step="0.01"
                  value={purchaseRate}
                  onChange={(e) =>
                    setPurchaseRate(e.target.value)
                  }
                />
              </div>

            </div>

            {/* Buttons */}
            <div className="product-form-actions mt-4">

              {!editId && (
                <button
                  type="submit"
                  className="btn btn-success"
                >
                  <i className="bi bi-floppy me-2"></i>
                  Save Product
                </button>
              )}

              {editId && (
                <button
                  type="submit"
                  className="btn btn-warning"
                >
                  <i className="bi bi-pencil-square me-2"></i>
                  Update Product
                </button>
              )}

              <button
                type="button"
                className="btn btn-danger"
                onClick={handleCancel}
              >
                <i className="bi bi-arrow-counterclockwise me-2"></i>
                Cancel
              </button>

            </div>
          </form>
        </div>

        {/* Product List */}
        <div className="product-list-card">

          <div className="product-list-header">

            <div>
              <h5 className="product-section-title">
                <i className="bi bi-list-ul me-2"></i>
                Product List
              </h5>

              <p className="product-count">
                {products.length} product(s) added
              </p>
            </div>

            {/* Search */}
            <div className="product-search">
              <i className="bi bi-search"></i>

              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) =>
                  handleSearch(e.target.value)
                }
              />
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table product-table">

              <thead>
                <tr>
                  <th>Sl. No.</th>
                  <th>Product Code</th>
                  <th>Product Name</th>
                  <th>Group</th>
                  <th>GST / Tax</th>
                  <th>Unit</th>
                  <th>Sales Rate (₹)</th>
                  <th>Purchase Rate (₹)</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {currentProducts.length > 0 ? (
                  currentProducts.map((product, index) => (
                    <tr key={product._id}>
                      <td>
                        {indexOfFirstRecord + index + 1}
                      </td>

                      <td>{product.productCode}</td>

                      <td>{product.productName}</td>

                      <td>
                        {product.groupName ||
                          product.groupId?.groupName ||
                          product.group?.groupName ||
                          "-"}
                      </td>

                      <td>
                        {product.taxName ||
                          product.taxId?.taxName ||
                          product.tax?.taxName ||
                          "-"}
                        {(product.taxRate ??
                          product.taxId?.taxRate ??
                          product.tax?.taxRate) != null &&
                          ` (${product.taxRate ??
                          product.taxId?.taxRate ??
                          product.tax?.taxRate
                          }%)`}
                      </td>

                      <td>{product.unit}</td>

                      <td className="text-end">
                        {Number(
                          product.salesRate
                        ).toFixed(2)}
                      </td>

                      <td className="text-end">
                        {Number(
                          product.purchaseRate
                        ).toFixed(2)}
                      </td>

                      <td>
                        <div className="product-action-buttons">

                          <button
                            className="btn btn-edit-product"
                            title="Edit"
                            onClick={() =>
                              handleEdit(product)
                            }
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>

                          {/* <button
                            className="btn btn-delete-product"
                            title="Delete"
                            onClick={() =>
                              handleDelete(product._id)
                            }
                          >
                            <i className="bi bi-trash"></i>
                          </button> */}

                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr key="empty-product-row">
                    <td
                      colSpan="9"
                      className="product-empty-state"
                    >
                      <i className="bi bi-inbox"></i>

                      <p>
                        {searchTerm
                          ? "No matching products found"
                          : "No products added yet"}
                      </p>

                      <small>
                        Add your first product using the form above.
                      </small>
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className="product-pagination">

              <span>
                Showing {indexOfFirstRecord + 1} to{" "}
                {Math.min(
                  indexOfLastRecord,
                  filteredProducts.length
                )}{" "}
                of {filteredProducts.length} products
              </span>

              <div className="pagination-buttons">

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(currentPage - 1)
                  }
                >
                  <i className="bi bi-chevron-left"></i>
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    className={
                      currentPage === page
                        ? "active"
                        : ""
                    }
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage(currentPage + 1)
                  }
                >
                  <i className="bi bi-chevron-right"></i>
                </button>

              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductMaster;