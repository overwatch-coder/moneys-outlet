import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
// import { useStatus } from "./StatusOverlay"
import { ScrollArea } from "./ui/scroll-area"

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    onPaymentComplete: () => void
    orderId: string
}

export default function PaymentModal({ isOpen, onClose, onPaymentComplete, orderId }: PaymentModalProps) {
    const [copiedMomo, setCopiedMomo] = useState(false)
    const [copiedBank, setCopiedBank] = useState(false)
    // const showStatus = useStatus((state) => state.showStatus)

    const copyToClipboard = (text: string, type: 'momo' | 'bank') => {
        navigator.clipboard.writeText(text)
        if (type === 'momo') setCopiedMomo(true)
        else setCopiedBank(true)
        setTimeout(() => {
            if (type === 'momo') setCopiedMomo(false)
            else setCopiedBank(false)
        }, 2000)
    }

    const handleDone = () => {
        // Call the payment complete callback to show success screen
        onPaymentComplete()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] bg-bg-secondary border-white/10 p-0 text-white rounded-3xl overflow-hidden flex flex-col">
                <DialogTitle className="sr-only">Payment Information</DialogTitle>
                <ScrollArea className="flex-1 w-full h-full custom-scrollbar overflow-y-auto">
                    <div className="p-8">
                        <div className="flex flex-col items-center text-center mb-8">
                            <h2 className="text-primary font-bold uppercase tracking-[0.2em] text-xs mb-2">Payment Information</h2>
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase">Order ID: #{orderId}</h3>
                        </div>

                        <div className="space-y-8">
                            {/* Momo Details */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-black italic uppercase tracking-widest text-white flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                                    Momo Details
                                </h4>
                                <div className="bg-bg-tertiary p-5 rounded-2xl border border-white/5 relative group">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">Momo Number</p>
                                    <p className="text-lg font-bold text-white mb-4">0555554474</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">Name</p>
                                    <p className="text-lg font-bold text-white">Felix Adotul</p>

                                    <button
                                        onClick={() => copyToClipboard('0555554474', 'momo')}
                                        className="absolute top-4 right-4 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                                    >
                                        {copiedMomo ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Bank Details */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-black italic uppercase tracking-widest text-white flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                                    Bank Details
                                </h4>
                                <div className="bg-bg-tertiary p-5 rounded-2xl border border-white/5 relative group">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">Account Details</p>
                                    <p className="text-lg font-bold text-white mb-4">0555554474</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">Account Name</p>
                                    <p className="text-lg font-bold text-white">Felix Adotul</p>

                                    <button
                                        onClick={() => copyToClipboard('0555554474', 'bank')}
                                        className="absolute top-4 right-4 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                                    >
                                        {copiedBank ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 p-4 bg-primary/10 border border-primary/20 rounded-2xl text-center">
                            <p className="text-xs font-bold text-primary uppercase tracking-wider">
                                Please use your Order ID as Payment Reference
                            </p>
                        </div>

                        <Button
                            onClick={handleDone}
                            className="w-full mt-8 bg-white text-black hover:bg-primary hover:text-white font-black italic uppercase py-8 text-xl rounded-2xl transition-all shadow-xl"
                        >
                            Done
                        </Button>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
