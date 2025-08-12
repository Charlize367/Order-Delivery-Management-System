import React from 'react'

const Item = ({items : {catalog_ID, catalog_name, catalog_price, catalog_image} } ) => {

  return (
    <div className="item">
        <img className="image" src={`http://localhost:8083/${catalog_image}`} />
        <p className="catalog_name">{catalog_name}</p>
        <p className="catalog_price">{catalog_price}</p>
    </div>
  )
}

export default Item