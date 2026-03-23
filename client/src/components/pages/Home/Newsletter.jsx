'use client';
import api from '@/api/api';
import Loader from '@/components/ui/Loader';
import ValidationToast from '@/components/ui/ValidationToast';
import { base_url } from '@/constants/utils';
import useAuthStore from '@/store/authStore';
import { useEffect, useState } from 'react';

const Newsletter = () => {
    const { isAuthenticated, user } = useAuthStore();
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [toast, setToast] = useState({});

    useEffect(() => {
        if (isAuthenticated) {
            setFormData({
                id: user?.id,
                email: formData.email
            })
        } else {
            setFormData({
                email: formData.email
            })
        }
    }, [isAuthenticated, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSubscribed(false);
        try {
            const { data } = await api.post(`${base_url}/newsletter/subscribe`, formData);
            if (data?.success) {
                setIsLoading(false);
                setFormData(prev => ({ ...prev, email: "" }));
                setSubscribed(true);
                setToast({
                    type: "success",
                    message: "You have successfully subscribed to our newsletter."
                })
            } else {
                setIsLoading(false);
                setSubscribed(true);
                setToast({
                    type: "error",
                    message: data?.message ?? "Something went wrong."
                })
            }
        } catch (error) {
            setIsLoading(false);
            setSubscribed(true);
            setToast({
                type: "error",
                message: error?.response?.data?.message ?? "Something went wrong."
            })
            console.log(error);
        }

    };

    return (
        <section className="px-7 py-24 text-center border-t border-b" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="max-w-2xl mx-auto">
                <h2 className="heading-2 font-serif pb-4">Subscribe to our Newsletter</h2>
                <p className="text-body text-muted pb-8">
                    Get the latest posts, exclusive insights, and news delivered directly to your inbox.
                </p>
                {subscribed && (
                <ValidationToast type={toast.type} message={toast.message} closeToast={setToast} />
                )}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
                >
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                        placeholder="Your email address"
                        className="form-input flex-1"
                        required
                    />
                    <button type="submit" disabled={isLoading} className="btn btn-dark px-8">
                        {isLoading ? <Loader size="sm" text={"Subscribing..."} /> : "Subscribe"}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Newsletter;
