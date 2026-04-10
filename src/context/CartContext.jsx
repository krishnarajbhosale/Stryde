import { createContext, useContext, useReducer, useState, useCallback } from 'react'

const CartContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { productId, size = 'M', customSizeId, customerHeight = '' } = action.payload
      const hNorm = customSizeId != null ? '' : String(customerHeight || '').trim()
      const existing = state.findIndex((i) => {
        if (i.productId !== productId) return false
        if (customSizeId != null) return i.customSizeId === customSizeId
        const ih = String(i.customerHeight || '').trim()
        return i.size === size && i.customSizeId == null && ih === hNorm
      })
      if (existing >= 0) {
        const next = [...state]
        next[existing].quantity += 1
        return next
      }
      const item = { productId, size: customSizeId != null ? 'Custom' : size, quantity: 1 }
      if (customSizeId != null) item.customSizeId = customSizeId
      else if (hNorm) item.customerHeight = hNorm
      return [...state, item]
    }
    case 'REMOVE':
      return state.filter((_, i) => i !== action.payload.index)
    case 'UPDATE_QUANTITY':
      return state.map((item, i) =>
        i === action.payload.index
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      )
    case 'UPDATE_SIZE':
      return state.map((item, i) =>
        i === action.payload.index
          ? { ...item, size: action.payload.size, customerHeight: '' }
          : item
      )
    case 'UPDATE_HEIGHT':
      return state.map((item, i) =>
        i === action.payload.index
          ? { ...item, customerHeight: action.payload.customerHeight }
          : item
      )
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [])
  const [promo, setPromo] = useState(null)
  const [showAddedToCart, setShowAddedToCart] = useState(false)

  const addToCart = useCallback((productId, size = 'M', customSizeId = null, customerHeight = '') => {
    dispatch({ type: 'ADD', payload: { productId, size, customSizeId, customerHeight } })
    setShowAddedToCart(true)
  }, [])

  const dismissAddedToCart = useCallback(() => setShowAddedToCart(false), [])

  const removeFromCart = useCallback((index) => {
    dispatch({ type: 'REMOVE', payload: { index } })
    setShowAddedToCart(false)
  }, [])

  const updateQuantity = (index, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity } })
  }

  const updateSize = (index, size) => {
    dispatch({ type: 'UPDATE_SIZE', payload: { index, size } })
  }

  const updateCustomerHeight = (index, customerHeight) => {
    dispatch({ type: 'UPDATE_HEIGHT', payload: { index, customerHeight } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR' })
    setPromo(null)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        promo,
        setPromo,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateSize,
        updateCustomerHeight,
        clearCart,
        showAddedToCart,
        dismissAddedToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
