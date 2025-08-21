import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect } from 'react'


const Basket = () => {
  return (
    <div className="body">
      <Header />
    </div>
  )
}

export default Basket