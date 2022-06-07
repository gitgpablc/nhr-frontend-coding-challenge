import React, { useState, useEffect } from 'react';
import { Service } from './Service';
import moment from 'moment';

function App() {
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const [data, setData] = useState({
    name: '',
    paymentStatus: 'CURRENT',
    leaseEndDate: ''
  })

  const handleInputChange = (event) => {
    setData({
      ...data,
      [event.target.name]: event.target.value
    })
  }

  const handleClickAdd = (e) => {
    e.preventDefault();
    setShowForm(true);
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
      _filteredTenants = tenants.filter(x => moment().isBefore(x.leaseEndDate, 'month'));
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

  useEffect(() => {
    updateTenants();
  }, []);

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
      <div className="container">
        <h1>Tenants</h1>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a className={`nav-link ${currentTab === 0 && 'active'}`} onClick={() => handleTab(0)}>All</a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${currentTab === 1 && 'active'}`} onClick={() => handleTab(1)}>Payment is late</a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${currentTab === 2 && 'active'}`} onClick={() => handleTab(2)}>Lease ends in less than a month</a>
          </li>
        </ul>
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Payment Status</th>
              <th>Lease End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getData().map(tenant => {
              return (
                <tr key={tenant.id}>
                  <th>{tenant.id}</th>
                  <td>{tenant.name}</td>
                  <td>{tenant.paymentStatus}</td>
                  <td>{tenant.leaseEndDate}</td>
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
        <button className="btn btn-secondary" onClick={handleClickAdd}>Add Tenant</button>
      </div>
      {showForm &&
        <div className="container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input className="form-control" onChange={handleInputChange} name="name" maxLength="25" />
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
              <input className="form-control" type="datetime-local" onChange={handleInputChange} name="leaseEndDate" />
              {/* min={new Date().toISOString().split(".")[0]} */}
            </div>
            <button className="btn btn-primary" type="submit">Save</button>
            <button className="btn" onClick={handleClickCancel}>Cancel</button>
          </form>
        </div>}
    </>
  );
}

export default App;
