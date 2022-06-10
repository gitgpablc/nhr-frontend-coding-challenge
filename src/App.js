import React, { useState, useEffect, useRef } from 'react';
import { Service } from './Service';
import moment from 'moment';

//Version 2
function App() {
  //States
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [order, setOrder] = useState("ASC");
  const [data, setData] = useState({
    name: '',
    paymentStatus: 'CURRENT',
    leaseEndDate: ''
  })

  const sorting = (col) => {
    if (order === "ASC") {
      const sorted = [...tenants].sort((a, b) =>
        a[col].toString().toLowerCase() > b[col].toString().toLowerCase() ? 1 : -1);
      setTenants(sorted);
      setOrder("DSC");
    }

    if (order === "DSC") {
      const sorted = [...tenants].sort((a, b) =>
        a[col].toString().toLowerCase() < b[col].toString().toLowerCase() ? 1 : -1);
      setTenants(sorted);
      setOrder("ASC");
    }
  }

  //Hooks
  const divTenant = useRef(null);

  useEffect(() => {
    updateTenants();
  }, []);

  //Events
  const handleInputChange = (event) => {
    //console.log(data);
    setData({
      ...data,
      [event.target.name]: event.target.value
    })
  }

  const handleClickAdd = (e) => {
    e.preventDefault();
    setShowForm(true);
    scrolltoTenant(divTenant);
  }

  const scrolltoTenant = (ref) => {
    if (!ref.current) return;
    ref.current.scrollIntoView({ behavior: 'smooth' });
  }

  const handleClickCancel = (e) => {
    e.preventDefault();
    setShowForm(false);
  }

  const handleClickDelete = (tenantId) => {
    Service.deleteTenant(tenantId).then(() => {
      updateTenants();
    });
  }

  const handleTab = (tabId) => {
    let _filteredTenants = tenants;
    if (tabId === 1) {
      _filteredTenants = tenants.filter(x => x.paymentStatus === "LATE");
    }
    if (tabId === 2) {
      _filteredTenants = tenants.filter(x => moment(x.leaseEndDate).isBetween(moment().startOf("day"), moment().add(1, 'month')));
    }
    setFilteredTenants(_filteredTenants)
    setCurrentTab(tabId);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    Service.addTenant(data).then(() => {
      updateTenants();
    });
  }

  //Functions
  const updateTenants = () => {
    Service.getTenants().then(
      (res) => {
        setTenants(res);
        setShowForm(false);
      }
    );
  }

  const getData = () => {
    switch (currentTab) {
      case 1:
        return filteredTenants;
      case 2:
        return filteredTenants;
      default:
        return tenants;
    }
  }

  return (
    <>
      <div className="container m-5">
        <h1>Tenants</h1>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${currentTab === 0 && 'active'}`}
              onClick={() => handleTab(0)}>All
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${currentTab === 1 && 'active'}`}
              onClick={() => handleTab(1)}>Payment is late
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${currentTab === 2 && 'active'}`}
              onClick={() => handleTab(2)}>Lease ends in less than a month
            </button>
          </li>
        </ul>
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => sorting("id")}>#</th>
              <th onClick={() => sorting("name")}>Name</th>
              <th onClick={() => sorting("paymentStatus")} className="d-flex justify-content-center">Payment Status</th>
              <th onClick={() => sorting("leaseEndDate")}>Lease End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getData().map(tenant => {
              return (
                <tr key={tenant.id}>
                  <td>{tenant.id}</td>
                  <td>{tenant.name}</td>
                  <td className="d-flex justify-content-center"><h5><span className={`text-white badge ${tenant.paymentStatus === 'CURRENT' ? 'bg-success' : 'bg-danger'}`}>{tenant.paymentStatus}</span></h5></td>
                  <td><span>{moment(tenant.leaseEndDate).format('MM/DD/YYYY, h:mm a')}</span></td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleClickDelete(tenant.id)}>Delete</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="container">
        <button className="btn btn-secondary mb-5" onClick={handleClickAdd}>Add Tenant</button>
      </div>
      {showForm &&
        <div className="container mb-5">
          <div className="card w-50">
            <h5 className="card-header">Add a Tenant</h5>
            <div className="card-body" ref={divTenant}>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name</label>
                  <input className="form-control" onChange={handleInputChange} name="name" maxLength="25" pattern="[a-zA-Z]*" required />
                </div>
                <div className="form-group">
                  <label>Payment Status</label>
                  <select className="form-control" onChange={handleInputChange} name="paymentStatus">
                    <option value="CURRENT">CURRENT</option>
                    <option value="LATE">LATE</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Lease End Date</label>
                  <input
                    className="form-control"
                    type="datetime-local"
                    onChange={handleInputChange}
                    min={new Date().toISOString().slice(0, -8)}
                    name="leaseEndDate" required />
                </div>
                <div className="d-flex justify-content-center">
                  <button className="btn btn-primary mr-4" type="submit">Save</button>
                  <button className="btn btn-danger" onClick={handleClickCancel}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }
    </>
  );
}

export default App;
