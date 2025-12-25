import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";

import { useEffect, useState } from "react";
import { useStatus } from "@/components/StatusOverlay";
import { dataService } from "@/lib/dataService";

export default function Contact() {
  const showStatus = useStatus((state) => state.showStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.message) {
      showStatus("error", "Error", "Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      await dataService.sendContactMessage({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        message: formData.message,
        subject: formData.phone ? `Phone: ${formData.phone}` : undefined,
      });
      showStatus(
        "success",
        "Success",
        "Your message has been sent successfully!"
      );
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      showStatus("error", "Error", "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen pt-32 pb-20">
      <div className="container px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left: Contact Info */}
            <div className="flex flex-col justify-center">
              <h2 className="text-primary font-bold uppercase tracking-[0.4em] text-sm mb-4">
                Contact Us
              </h2>
              <h1 className="text-5xl md:text-7xl font-black italic text-white tracking-tighter leading-tight mb-8">
                GET IN <br />
                <span className="text-primary">TOUCH</span>
              </h1>
              <p className="text-muted text-lg mb-12 max-w-md leading-relaxed">
                Have a question or need assistance? Our team is here to help.
                Reach out to us and we'll get back to you as soon as possible.
              </p>

              <div className="space-y-8">
                <div className="flex items-center gap-6 group">
                  <div className="h-14 w-14 rounded-2xl bg-bg-secondary border border-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-xl shadow-primary/5">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">
                      Email Us
                    </p>
                    <p className="text-xl font-bold text-white">
                      support@moneysoutlet.com
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="h-14 w-14 rounded-2xl bg-bg-secondary border border-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-xl shadow-primary/5">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">
                      Call Us
                    </p>
                    <p className="text-xl font-bold text-white">
                      +233 55 358 9474
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="h-14 w-14 rounded-2xl bg-bg-secondary border border-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-xl shadow-primary/5">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">
                      Visit Us
                    </p>
                    <p className="text-xl font-bold text-white">Accra, Ghana</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="bg-bg-secondary rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 blur-[100px] -mr-32 -mt-32"></div>

              <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted ml-1">
                      First Name
                    </label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      className="bg-bg-tertiary border-white/5 h-14 rounded-2xl focus-visible:ring-primary focus-visible:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted ml-1">
                      Last Name
                    </label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className="bg-bg-tertiary border-white/5 h-14 rounded-2xl focus-visible:ring-primary focus-visible:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted ml-1">
                    Email Address
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="bg-bg-tertiary border-white/5 h-14 rounded-2xl focus-visible:ring-primary focus-visible:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted ml-1">
                    Phone Number
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+233 55 123 4567"
                    className="bg-bg-tertiary border-white/5 h-14 rounded-2xl focus-visible:ring-primary focus-visible:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted ml-1">
                    Message
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className="bg-bg-tertiary border-white/5 min-h-[150px] rounded-2xl focus-visible:ring-primary focus-visible:border-primary transition-all resize-none"
                  />
                </div>

                <Button
                  disabled={isLoading}
                  className="w-full bg-white text-black hover:bg-primary hover:text-white font-black italic uppercase py-8 text-xl rounded-2xl transition-all flex gap-3 shadow-xl"
                >
                  {isLoading ? "Sending..." : "Send Message"}{" "}
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
