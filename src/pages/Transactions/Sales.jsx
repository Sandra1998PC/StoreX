
import React, { useEffect, useState } from "react";
import { addSalesAPI, getAllSalesAPI, getDistinctInvoiceNumbersAPI, getProductAPI, getSalesByInvoiceNumberAPI, updateSalesAPI } from "../../services/allAPIs";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./Sales.css";
import axiosInstance from "../../services/axiosInstance";

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [invoices, setInvoices] = useState([]);
  const [invoiceNumbers, setInvoiceNumbers] = useState([]);
  const [searchInvoiceNo, setSearchInvoiceNo] = useState("");
  const [editInvoiceId, setEditInvoiceId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const invoicesPerPage = 5;
  const [productSearch, setProductSearch] = useState("");
  const [showProductResults, setShowProductResults] = useState(false);
  const [salesRate, setSalesRate] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [showInvoiceResults, setShowInvoiceResults] = useState(false);
  const [imgCurrentPage, setImgCurrentPage] = useState(1);
  const productsPerPage = 6;

  const getInvoiceNumbers = async () => {
    try {
      const result = await getDistinctInvoiceNumbersAPI();
      if (result?.status === 200) {
        setInvoiceNumbers(result.data.data);
      }
    } catch (error) {
      console.error("Error fetching invoice numbers:", error);
    }
  };

  useEffect(() => {
    getInvoiceNumbers();
  }, []);

  const getAllSales = async () => {
    try {
      const result = await getAllSalesAPI();

      console.log("Sales API Response:", result);

      if (result && result.status === 200) {
        setInvoices(result.data.data);
      }

    } catch (error) {
      console.error(
        "Error fetching invoices:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
        "Error fetching invoices"
      );
    }
  };

  useEffect(() => {
    getAllSales();
  }, []);

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem("data"));
    setUserData(data);
  }, []);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProductAPI();
        setProducts(response.data.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Unable to load products");
      }
    };

    fetchProducts();
  }, []);

  // Generate invoice number
  const generateInvoiceNo = () => {
    const highestInvoice = invoices.reduce((max, invoice) => {
      const number = parseInt(invoice.invoiceNo.replace("INV", ""), 10);
      return Math.max(max, number || 0);
    }, 0);

    return "INV" + String(highestInvoice + 1).padStart(4, "0");
  };

  // Initialize invoice number
  useEffect(() => {
    if (!editInvoiceId) {
      setInvoiceNo(generateInvoiceNo());
    }
  }, [invoices, editInvoiceId]);

  // Selected product
  const selectedProductData = products.find(
    (product) => product._id === selectedProduct
  );

  // Add item to invoice
  const handleAddItem = () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }

    const product = selectedProductData;

    const existingItem = items.find(
      (item) => item.productId === product._id
    );

    if (existingItem) {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.productId === product._id
            ? {
              ...item,
              quantity: item.quantity + Number(quantity),
              amount:
                (item.quantity + Number(quantity)) * item.rate,
            }
            : item
        )
      );
    } else {
      setItems((prevItems) => [
        ...prevItems,
        {
          productId: product._id,
          productCode: product.productCode,
          productName: product.productName,
          unit: product.unit,
          quantity: Number(quantity),
          rate: Number(salesRate),
          amount: Number(quantity) * Number(product.salesRate),
        },
      ]);
    }

    setSelectedProduct("");
    setQuantity(1);
    setProductSearch("")
    setShowProductResults(false)
    setSalesRate("")
  };

  // Increase quantity
  const increaseQuantity = (productId) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? {
            ...item,
            quantity: item.quantity + 1,
            amount: (item.quantity + 1) * item.rate,
          }
          : item
      )
    );
  };

  // Decrease quantity
  const decreaseQuantity = (productId) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? {
            ...item,
            quantity: Math.max(1, item.quantity - 1),
            amount:
              Math.max(1, item.quantity - 1) * item.rate,
          }
          : item
      )
    );
  };

  // Change quantity manually
  const handleQuantityChange = (productId, value) => {
    const qty = Number(value);

    if (qty < 1 || !value) return;

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? {
            ...item,
            quantity: qty,
            amount: qty * item.rate,
          }
          : item
      )
    );
  };

  // Change rate
  const handleRateChange = (productId, value) => {
    const rate = Number(value);

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? {
            ...item,
            rate,
            amount: item.quantity * rate,
          }
          : item
      )
    );
  };

  // Remove item
  const handleRemoveItem = (productId) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId)
    );
  };

  // Totals
  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const grandTotal = items.reduce(
    (total, item) => total + item.amount,
    0
  );

  const handleUpdateSales = async () => {

    const reqBody = {
      InvoiceNumber: invoiceNo,
      InvoiceDate: invoiceDate,
      data: items,
      CustomerId: userData?.existingUser._id,
      CustomerName: customerName,
      NetAmount: grandTotal
    };

    try {
      const result = await updateSalesAPI(editInvoiceId, reqBody);

      if (result.status === 200) {
        toast.success("Sales Invoice Updated Successfully");
        // Refresh invoice list
        getAllSales();
        // Refresh invoice numbers
        getInvoiceNumbers();
      }

    } catch (error) {
      console.error(
        "Error updating invoice:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
        "Error updating invoice"
      );
    }
  };

  // Save invoice
  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    // if (customerName === "") {
    //   toast.error("Please add Customer Name");
    //   return;
    // }

    if (editInvoiceId) {
      handleUpdateSales()
    }
    else {
      console.log("items", items);

      const invoiceData = {
        InvoiceNumber: invoiceNo,
        InvoiceDate: invoiceDate,
        data: items,
        CustomerId: userData?.existingUser._id,
        CustomerName: customerName,
        NetAmount: grandTotal
      };
      try {
        const addedSalesInvoice = await addSalesAPI(invoiceData)
        if (addedSalesInvoice.status === 201) {
          toast.success("Product added successfully");
          // Refresh invoice list
          getAllSales();
          // Refresh invoice numbers
          getInvoiceNumbers();
        }
      } catch (error) {
        console.error(
          "Error adding Invoice:",
          error.response?.data || error
        );

        toast.error(
          error.response?.data?.error ||
          "Error adding Invoice"
        );
      }
    }
    handleReset();
    setCurrentPage(1);
  };

  // Reset
  const handleReset = () => {
    setItems([]);
    setSelectedProduct("");
    setQuantity(1);
    setInvoiceDate(new Date().toISOString().split("T")[0]);
    setEditInvoiceId(null);
    setSearchInvoiceNo("");
    setCustomerName("")
    setSalesRate("")
    setProductSearch("")
    setShowProductResults(false)
    setInvoiceSearch("")
    showInvoiceResults(false)
  };

  // Delete item confirmation
  const handleDeleteItem = async (productId) => {
    const result = await Swal.fire({
      title: "Remove Item?",
      text: "Do you want to remove this item from the invoice?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#14532D",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Remove",
    });

    if (result.isConfirmed) {
      handleRemoveItem(productId);
    }
  };

  const onChangeQty = (e) => {
    console.log("selectedProduct", selectedProduct);
    const selectedProductData = products.filter((item) => item._id === selectedProduct)
    console.log("selectedProductData", selectedProductData);

    const enteredQty = Number(e.target.value);

    if (enteredQty <= selectedProductData[0].unit) {
      setQuantity(enteredQty);
    } else {
      toast.error(`Only ${selectedProductData[0].unit} items are available in stock`);
      setQuantity(selectedProductData[0].unit);
    }
  };

  const getSalesDetails = async (invoiceNumber) => {
    try {
      const result = await getSalesByInvoiceNumberAPI(invoiceNumber);
      console.log("result ", result);

      if (result.status === 200) {
        const { salesMaster, salesItems } = result.data.data;

        console.log("Invoice Details:", salesMaster);
        console.log("Product Details:", salesItems);

        const updatedItems = salesItems.map((item) => ({
          productCode: item.ProductCode,
          productId: item.ProductId,
          productName: item.ProductName,
          quantity: item.Qty,
          rate: item.Rate,
          amount: item.Amount,
          // unit: item.unit
        }));

        setItems(updatedItems);
      }

    } catch (error) {
      console.error(
        "Error fetching sales:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
        "Error fetching sales details"
      );
    }
  };

  const onSelectInvoice = (e) => {
    setSearchInvoiceNo(e.target.value)
    getSalesDetails(e.target.value)
  }

  // Load invoice for editing
  // const handleLoadInvoice = () => {
  //   const invoice = invoices.find(
  //     (inv) =>
  //       inv.invoiceNo.toLowerCase() ===
  //       searchInvoiceNo.trim().toLowerCase()
  //   );
  // };

  const handleEditDropdown = (e) => {
    const selectedInvoice = e.target.value;
    setSearchInvoiceNo(selectedInvoice);
    if (selectedInvoice) {
      getSalesDetails(selectedInvoice);
    }
    const invoice = invoices.filter((item) => item.invoiceNo === selectedInvoice)
    if (!invoice) {
      toast.error("Invoice not found");
      return;
    }
    console.log("To be edited invoice", invoice);
    setInvoiceNo(invoice[0].invoiceNo);
    setInvoiceDate(invoice[0].invoiceDate);
    setItems(invoice[0].items);
    setEditInvoiceId(invoice[0].id);
    setCustomerName(invoice[0].CustomerName)
    toast.success("Invoice loaded for editing");
  }

  // Calculate pagination
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;

  const currentInvoices = invoices.slice(
    indexOfFirstInvoice,
    indexOfLastInvoice
  );

  const totalPages = Math.ceil(invoices.length / invoicesPerPage);

  const filteredProducts = products.filter((product) =>
    `${product.productCode} ${product.productName}`
      .toLowerCase()
      .includes(productSearch.toLowerCase())
  );

  const formattedInvoiceDate = invoiceDate
    ? new Date(invoiceDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).replace(/ /g, "/")
    : "";

  const filteredInvoices = invoiceNumbers.filter((number) =>
    number.toLowerCase().includes(invoiceSearch.toLowerCase())
  );

  const handleAddProduct = (product) => {

    const existingItem = items.find(
      (item) => item.productId === product._id
    );

    if (existingItem) {

      increaseQuantity(product._id);

    } else {

      const newItem = {
        productId: product._id,
        productName: product.productName,
        productCode: product.productCode,
        unit: product.unit,
        quantity: 1,
        rate: Number(product.salesRate),
        amount: Number(product.salesRate),
      };

      setItems((prevItems) => [...prevItems, newItem]);

    }
  };

  const imgTotalPages = Math.ceil(products.length / productsPerPage);

  const indexOfLastProduct = imgCurrentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const handlePageChange = (page) => {
    setImgCurrentPage(page);
  };

  return (
    <>
      <Navbar />

      <div className="sales-container">

        {/* Header */}
        <div className="sales-header">
          <div>
            <h2>
              <i className="bi bi-receipt me-2"></i>
              Sales Invoice
            </h2>
            <p>Create and manage sales invoices</p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="sales-card">
          <h5 className="sales-section-title">
            <i className="bi bi-file-earmark-text me-2"></i>
            Invoice Details
          </h5>

          <div className="row g-3">

            {/* <div className="col-md-4">
              <label className="form-label">Invoice Number</label>
              <input
                type="text"
                className="form-control read-only-input"
                value={invoiceNo}
                readOnly
              />
            </div> */}

            <div className="col-md-2">
              <label className="form-label">Edit Existing Invoice</label>

              <div className="input-group">

                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search Invoice..."
                    value={invoiceSearch}
                    onChange={(e) => {
                      setInvoiceSearch(e.target.value);
                      setShowInvoiceResults(true);
                      setSearchInvoiceNo("");
                    }}
                    onFocus={() => setShowInvoiceResults(true)}
                  />

                  {showInvoiceResults && invoiceSearch.trim() !== "" && (
                    <ul
                      className="list-group position-absolute w-100"
                      style={{
                        zIndex: 1000,
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      {filteredInvoices.length > 0 ? (
                        filteredInvoices.map((number) => (
                          <li
                            key={number}
                            className="list-group-item list-group-item-action"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setSearchInvoiceNo(number);
                              setInvoiceSearch(number);
                              setShowInvoiceResults(false);

                              // Execute your existing edit dropdown logic
                              handleEditDropdown({
                                target: { value: number },
                              });
                            }}
                          >
                            {number}
                          </li>
                        ))
                      ) : (
                        <li className="list-group-item text-muted">
                          No invoices found
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <label className="form-label">Invoice Date</label>
              <input
                type="text"
                className="form-control read-only-input"
                value={formattedInvoiceDate}
                readOnly
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Customer Name</label>
              <input
                type="text"
                className="form-control"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

          </div>
        </div>

        {/* Add Product */}
        <div className="sales-card">
          <h5 className="sales-section-title">
            <i className="bi bi-cart-plus me-2"></i>
            Add Products
          </h5>

          <div className="row g-3 align-items-end">

            <div className="col-md-5">
              <label className="form-label">Select Product</label>

              <input
                type="text"
                className="form-control"
                placeholder="Search Product..."
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setShowProductResults(true);
                  setSelectedProduct("");
                }}
                onFocus={() => setShowProductResults(true)}
              />

              {showProductResults && productSearch.trim() !== "" && (
                <ul
                  className="list-group position-absolute w-100"
                  style={{
                    zIndex: 1000,
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <li
                        key={product._id}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSelectedProduct(product._id);
                          setProductSearch(
                            `${product.productCode} - ${product.productName}`
                          );
                          setSalesRate(product.salesRate);
                          setShowProductResults(false);
                        }}
                      >
                        {product.productCode} - {product.productName}
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item text-muted">
                      No products found
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div className="col-md-3">
              <label className="form-label">Rate (₹)</label>

              <input
                type="number"
                className="form-control"
                value={salesRate}
                onChange={(e) => setSalesRate(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">Quantity</label>

              <input
                type="number"
                className="form-control"
                min="1"
                value={quantity}
                onChange={(e) =>
                  onChangeQty(e)
                }
              />
            </div>

            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleAddItem}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Add Item
              </button>
            </div>

          </div>
        </div>

        {/* Items Table */}
        <div className="sales-card">
          <div className="sales-list-header">
            <h5 className="sales-section-title mb-0">
              <i className="bi bi-list-ul me-2"></i>
              Invoice Items
            </h5>

            <span className="sales-item-count">
              {items.length} item(s)
            </span>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="table-responsive">
                <table className="table sales-table border rounded">
                  <thead>
                    <tr>
                      <th>Sl. No.</th>
                      <th>Product</th>
                      {/* <th>Unit</th> */}
                      <th>Quantity</th>
                      <th>Rate (₹)</th>
                      <th>Amount (₹)</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.length > 0 ? (
                      items.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>

                          <td>
                            <strong>{item.productName}</strong>
                            <small className="d-block text-muted">
                              {item.productCode}
                            </small>
                          </td>

                          {/* <td>{item.unit}</td> */}

                          <td>
                            <div className="sales-qty-control">
                              <button
                                type="button"
                                onClick={() =>
                                  decreaseQuantity(item.productId)
                                }
                              >
                                −
                              </button>

                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    item.productId,
                                    e.target.value
                                  )
                                }
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  increaseQuantity(item.productId)
                                }
                              >
                                +
                              </button>
                            </div>
                          </td>

                          <td>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="sales-rate-input"
                              value={item.rate}
                              onChange={(e) =>
                                handleRateChange(
                                  item.productId,
                                  e.target.value
                                )
                              }
                            />
                          </td>

                          <td className="sales-amount">
                            ₹{item.amount.toFixed(2)}
                          </td>

                          <td>
                            <button
                              type="button"
                              className="btn btn-sales-delete"
                              onClick={() =>
                                handleDeleteItem(item.productId)
                              }
                              title="Remove item"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="sales-empty">
                          <i className="bi bi-cart3"></i>
                          <p>No products added to this invoice</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div>
                {/* Invoice Summary */}
                <div className="sales-summary">
                  <div className="sales-summary-row">
                    <span>Total Items</span>
                    <strong>{items.length}</strong>
                  </div>

                  <div className="sales-summary-row">
                    <span>Total Quantity</span>
                    <strong>{totalQuantity}</strong>
                  </div>

                  <div className="sales-grand-total">
                    <span>Grand Total</span>
                    <strong>₹{grandTotal.toFixed(2)}</strong>
                  </div>
                </div>

                {/* Buttons */}
                <div className="sales-form-actions">
                  <button
                    type="button"
                    className={`btn ${editInvoiceId !== null ? "btn-warning" : "btn-success"}`}
                    onClick={handleSubmit}
                  >
                    <i className="bi bi-floppy me-2"></i>
                    {editInvoiceId ? "Update Invoice" : "Add Invoice"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleReset}
                  >
                    <i className="bi bi-arrow-counterclockwise me-2"></i>
                    Cancel
                  </button>
                </div>
              </div>
            </div>


            <div className="col-md-6">
              <div className="sales-card p-3">

                <h5 className="sales-section-title mb-3">
                  <i className="bi bi-grid me-2"></i>
                  Select Products
                </h5>

                <div className="row g-3">

                  {currentProducts.map((product) => (
                    <div className="col-6 col-md-4" key={product._id}>

                      <div className="product-select-card">

                        {/* Product Image */}
                        <div className="product-select-image">

                          {product.productImage ? (
                            <img
                              src={`${axiosInstance.defaults.baseURL}${product.productImage}`}
                              alt={product.productName}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}

                          <div
                            className="product-no-image"
                            style={{
                              display: product.productImage ? "none" : "flex"
                            }}
                          >
                            <i className="bi bi-image"></i>
                          </div>

                        </div>

                        {/* Product Details */}
                        <div className="product-select-details">

                          <strong
                            className="product-select-name"
                            title={product.productName}
                          >
                            {product.productName}
                          </strong>

                          <small className="text-muted">
                            {product.productCode}
                          </small>

                          <div className="product-select-price">
                            ₹{Number(product.salesRate).toFixed(2)}
                          </div>

                          <button
                            type="button"
                            className="btn btn-success btn-sm w-100 mt-2"
                            onClick={() => handleAddProduct(product)}
                          >
                            <i className="bi bi-plus-circle me-1"></i>
                            Add Item
                          </button>

                        </div>

                      </div>

                    </div>
                  ))}
                  {products.length > productsPerPage && (
                    <div className="col-12 d-flex justify-content-center align-items-center gap-3 mt-3">

                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm"
                        disabled={imgCurrentPage === 1}
                        onClick={() => handlePageChange(imgCurrentPage - 1)}
                      >
                        <i className="bi bi-chevron-left"></i> Previous
                      </button>

                      <span className="text-muted">
                        Page {imgCurrentPage} of {imgTotalPages}
                      </span>

                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm"
                        disabled={imgCurrentPage === imgTotalPages}
                        onClick={() => handlePageChange(imgCurrentPage + 1)}
                      >
                        Next <i className="bi bi-chevron-right"></i>
                      </button>

                    </div>
                  )}

                  {products.length === 0 && (
                    <div className="col-12 text-center text-muted py-4">
                      <i className="bi bi-box-seam fs-2"></i>
                      <p className="mt-2 mb-0">No products available</p>
                    </div>
                  )}

                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Saved Invoice List */}
        {/* <div className="sales-card">
          <h5 className="sales-section-title">
            <i className="bi bi-journal-text me-2"></i>
            Saved Invoices
          </h5>

          <div className="table-responsive">
            <table className="table sales-table">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total Qty</th>
                  <th>Total Amount</th>
                </tr>
              </thead>

              <tbody>
                {currentInvoices.length > 0 ? (
                  currentInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>{invoice.invoiceNo}</td>
                      <td>
                        {new Date(invoice.invoiceDate)
                          .toLocaleDateString("en-GB")
                          .replace(/\//g, "-")}
                      </td>
                      <td>{invoice.items.length}</td>
                      <td>{invoice.totalQuantity}</td>
                      <td>₹{invoice.grandTotal.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="sales-empty">
                      No invoices saved yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {invoices.length > 0 && (
              <div className="pagination-container">

                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    className={`pagination-btn ${currentPage === index + 1 ? "active" : ""
                      }`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>

              </div>
            )}
          </div>
        </div> */}

      </div>

      <Footer />
    </>
  );
};

export default Sales;
