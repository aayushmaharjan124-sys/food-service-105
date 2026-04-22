import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as cartService from '../services/cart.service'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const { isLoggedIn } = useAuth()
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) return setCart({ items: [], total: 0 })
    try {
      const { data } = await cartService.getCart()
      setCart(data)
    } catch {
      setCart({ items: [], total: 0 })
    }
  }, [isLoggedIn])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true)
    try {
      const { data } = await cartService.addToCart(productId, quantity)
      setCart(data)
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async (itemId, quantity) => {
    const { data } = await cartService.updateCartItem(itemId, quantity)
    setCart(data)
  }

  const removeItem = async (itemId) => {
    const { data } = await cartService.removeCartItem(itemId)
    setCart(data)
  }

  const clearCart = async () => {
    await cartService.clearCart()
    setCart({ items: [], total: 0 })
  }

  const itemCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, addToCart, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
