import React from 'react'
import './DescriptionBox.css'

const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
      <div className="descriptionbox-navigator">
        <div className="descriptionbox-nav-box">Description</div>
        <div className="descriptionbox-nav-box fade">Reviews (122)</div>
      </div>
      <div className="descriptionbox-description">
        <p>
        Welcome to SHOPPER, your ultimate destination for premium fashion. We take pride in offering high-quality clothing crafted from top-notch materials by reputable designers. Enjoy fast shipping with most orders arriving within a few days. Your satisfaction is our priority, which is why we offer a hassle-free return policy for any issues. Shop with confidence at [Website Name], where quality, speed, and customer satisfaction are always guaranteed.
        </p>
      </div>
    </div>
  )
}

export default DescriptionBox