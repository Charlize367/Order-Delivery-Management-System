import React from 'react'
import { useState, useEffect } from 'react'

const AdminItem = ({items : {catalog_ID, catalog_name, catalog_price, catalog_image} } ) => {



  return (
    <div className="item_card">
        <img className="catalog_image" src={`http://localhost:8083/images/${catalog_image}`}/>
        <p className="catalog_name">{catalog_name}</p>
        <p className="catalog_price">PHP {catalog_price}</p>
        <button className="editCatalog">Edit</button>
    </div>
  )
}

export default AdminItem