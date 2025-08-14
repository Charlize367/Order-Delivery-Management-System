import React from 'react'

const Category = ({category : {category_ID, category_name, category_image}}) => {

  
  return (
    <div className="category_card">
        
        <img className="category_image" src={`http://localhost:8083/images/${category_image}`}/>
       
        <p className="overlay">{category_name}</p>
    </div>
  )
}

export default Category