import React from 'react';
import { motion } from 'motion/react';
import { Shield, FileText, Lock, Eye, Scale, AlertCircle } from 'lucide-react';

const LegalLayout = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
  <div className="bg-background min-h-screen py-16 transition-colors duration-300">
    <div className="container mx-auto px-4 max-w-4xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden"
      >
        <div className="bg-emerald-600 p-8 md:p-12 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Icon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
          </div>
          <p className="text-emerald-50/80 text-lg">Last Updated: April 12, 2026</p>
        </div>
        <div className="p-8 md:p-12 prose dark:prose-invert prose-emerald max-w-none">
          {children}
        </div>
      </motion.div>
    </div>
  </div>
);

export const PrivacyPolicy = () => (
  <LegalLayout title="Privacy Policy" icon={Shield}>
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Eye className="h-6 w-6 text-emerald-600" />
        1. Introduction
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        At Dr. Sai Theja Orthopedic Care, we value your privacy and are committed to protecting your personal and medical data. 
        This Privacy Policy explains how we collect, use, and safeguard your information when you use our 
        telemedicine platform.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Lock className="h-6 w-6 text-emerald-600" />
        2. Information We Collect
      </h2>
      <ul className="list-disc pl-6 text-muted-foreground space-y-2">
        <li><strong>Personal Identity:</strong> Name, age, gender, and contact details.</li>
        <li><strong>Medical Records:</strong> Health history, symptoms, and reports uploaded by you.</li>
        <li><strong>Payment Data:</strong> Transaction IDs and payment status (we do not store your full card or UPI details).</li>
        <li><strong>Consultation Logs:</strong> Records of your calls and appointments with doctors.</li>
      </ul>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Shield className="h-6 w-6 text-emerald-600" />
        3. Data Security
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        We implement industry-standard security measures, including end-to-end encryption for calls and 
        secure cloud storage for medical records. Access to your medical data is strictly limited to 
        the consulting doctor and authorized hospital staff.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Scale className="h-6 w-6 text-emerald-600" />
        4. Your Rights
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        You have the right to access, correct, or request the deletion of your personal data at any time. 
        You can also withdraw your consent for tele-consultation, though this may limit our ability to 
        provide certain services.
      </p>
    </section>
  </LegalLayout>
);

export const TermsOfService = () => (
  <LegalLayout title="Terms of Service" icon={FileText}>
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <AlertCircle className="h-6 w-6 text-emerald-600" />
        1. Nature of Service
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Dr. Sai Theja Orthopedic Care is a medical platform. While we strive to provide the best care, 
        online consultations are not a replacement for emergency medical services. In case of a 
        life-threatening emergency, please visit the nearest hospital immediately.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Scale className="h-6 w-6 text-emerald-600" />
        2. User Responsibilities
      </h2>
      <ul className="list-disc pl-6 text-muted-foreground space-y-2">
        <li>You must provide accurate and complete health information.</li>
        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
        <li>You agree not to record or distribute consultation sessions without explicit consent.</li>
      </ul>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <FileText className="h-6 w-6 text-emerald-600" />
        3. Payments and Refunds
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Consultation fees must be paid in advance for online appointments. Refunds are processed 
        only if the consultation is cancelled by the doctor or due to technical failures on our platform. 
        Refunds may take 5-7 business days to reflect in your account.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Shield className="h-6 w-6 text-emerald-600" />
        4. Limitation of Liability
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Dr. Sai Theja Orthopedic Care and its staff are not liable for any indirect, incidental, or consequential damages 
        arising from the use of the platform, including but not limited to medical complications 
        resulting from inaccurate information provided by the user.
      </p>
    </section>
  </LegalLayout>
);
