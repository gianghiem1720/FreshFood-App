import React, { useEffect, useState } from 'react';
import './AdminPromotions.css';

const AdminPromotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [promoCode, setPromoCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const response = await fetch('http://localhost:4000/admin/promotions');
            const data = await response.json();
            setPromotions(data);
        } catch (error) {
            console.error('Error fetching promotions:', error);
        }
    };

    const handleAddPromoCode = async () => {
        try {
            const response = await fetch('http://localhost:4000/admin/promotions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ promo_code: promoCode, discount_amount: discountAmount }),
            });
            const result = await response.json();
            if (response.ok) {
                setMessage('Promo code added successfully!');
                setPromoCode('');
                setDiscountAmount('');
                fetchPromotions();
            } else {
                setMessage(result.message);
            }
        } catch (error) {
            console.error('Error adding promo code:', error);
            setMessage('Error adding promo code');
        }
    };

    const handleDeletePromoCode = async (promo_id) => {
        try {
            const response = await fetch(`http://localhost:4000/admin/promotions/${promo_id}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (response.ok) {
                setMessage('Promo code deleted successfully!');
                fetchPromotions();
            } else {
                setMessage(result.message);
            }
        } catch (error) {
            console.error('Error deleting promo code:', error);
            setMessage('Error deleting promo code');
        }
    };

    return (
        <div className='admin-promotions'>
            <h1>Manage Promotions</h1>
            <div className='add-promo'>
                <h2>Add Promo Code</h2>
                <input 
                    type='text' 
                    placeholder='Promo Code' 
                    value={promoCode} 
                    onChange={(e) => setPromoCode(e.target.value)} 
                />
                <input 
                    type='number' 
                    placeholder='Discount Amount' 
                    value={discountAmount} 
                    onChange={(e) => setDiscountAmount(e.target.value)} 
                />
                <button onClick={handleAddPromoCode}>Add Promo Code</button>
            </div>
            {message && <p>{message}</p>}
            <h2>Existing Promo Codes</h2>
            <ul>
                {promotions.map(promo => (
                    <li key={promo.promo_id}>
                        {promo.promo_code} - {promo.discount_amount} VND
                        <button onClick={() => handleDeletePromoCode(promo.promo_id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminPromotions;
