"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ChevronRight, Lock } from "lucide-react";

const formatPrice = (amount: string | number, currencyCode: string = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(Number(amount));
};

export default function CartPage() {
  const { cart, isLoading, updateItem, removeItem } = useCart();
  
  const subtotal = cart?.lines?.reduce((total: number, line: any) => total + (line.price * line.quantity), 0) || 0;
  const total = subtotal;
  const currency = "INR";

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 text-center" style={{ background: "var(--ivory)" }}>
        <h1 className="font-serif text-4xl mb-6" style={{ color: "var(--charcoal)" }}>Your Cart is Empty</h1>
        <p className="font-sans mb-8 text-sm max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
          You haven't added anything to your cart yet. Discover our botanical formulas to start your hair-care ritual.
        </p>
        <Link href="/shop" className="btn-primary">Explore Products</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20" style={{ background: "var(--ivory)" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <h1 className="font-serif text-4xl mb-12" style={{ color: "var(--charcoal)" }}>Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="hidden lg:grid grid-cols-12 gap-4 pb-4 border-b text-xs tracking-widest uppercase font-sans font-semibold" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
              {cart.lines.map((line: any) => (
                <li key={line.id} className="py-6 flex flex-col sm:flex-row lg:grid lg:grid-cols-12 gap-4 sm:gap-6 items-start sm:items-center">
                  <div className="flex gap-4 lg:col-span-6 w-full min-w-0 items-center">
                    <Link href={`/products/${line.handle}`} className="w-24 h-24 flex-shrink-0" style={{ background: "var(--cream)" }}>
                      {line.imageUrl && (
                        <Image src={line.imageUrl} alt={line.title} width={96} height={96} className="w-full h-full object-cover" />
                      )}
                    </Link>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <Link 
                        href={`/products/${line.handle}`} 
                        className="font-sans font-medium hover:text-forest-500 transition-colors block truncate whitespace-nowrap overflow-hidden text-ellipsis" 
                        style={{ color: "var(--charcoal)" }}
                        title={line.title}
                      >
                        {line.title}
                      </Link>
                      <button onClick={() => removeItem(line.id)} disabled={isLoading} className="text-xs font-sans mt-2 underline hover:no-underline flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-3 flex justify-start sm:justify-center w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="flex items-center border" style={{ borderColor: "var(--border-dark)" }}>
                      <button onClick={() => line.quantity > 1 ? updateItem(line.id, line.quantity - 1) : removeItem(line.id)} disabled={isLoading} className="w-10 h-10 flex items-center justify-center hover:bg-ivory-200 transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="w-12 text-center font-sans text-sm">{line.quantity}</span>
                      <button onClick={() => updateItem(line.id, line.quantity + 1)} disabled={isLoading} className="w-10 h-10 flex items-center justify-center hover:bg-ivory-200 transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-3 flex justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0 lg:text-right font-sans font-semibold" style={{ color: "var(--charcoal)" }}>
                    <span className="lg:hidden" style={{ color: "var(--text-muted)" }}>Total:</span>
                    {formatPrice(line.price * line.quantity, currency)}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4 p-8 border" style={{ background: "#fff", borderColor: "var(--border)" }}>
            <h2 className="font-serif text-2xl mb-6" style={{ color: "var(--charcoal)" }}>Order Summary</h2>
            
            <div className="space-y-4 pb-6 border-b font-sans text-sm" style={{ borderColor: "var(--border)" }}>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                <span style={{ color: "var(--charcoal)" }}>{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
                <span style={{ color: "var(--text-muted)" }}>Calculated at checkout</span>
              </div>
            </div>

            <div className="flex justify-between py-6 font-sans font-semibold text-lg" style={{ color: "var(--charcoal)" }}>
              <span>Estimated Total</span>
              <span>{formatPrice(total, currency)}</span>
            </div>

            <Link href="/checkout" className="btn-primary w-full justify-center py-4 mb-4 text-sm">
              <Lock size={14} className="mr-2" /> Checkout via UPI <ChevronRight size={16} className="ml-2" />
            </Link>

            <p className="text-xs text-center font-sans" style={{ color: "var(--text-muted)" }}>
              Taxes and shipping are calculated during checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
