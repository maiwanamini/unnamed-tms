import Link from "next/link";

export const metadata = {
  title: "Terms and Conditions - TMS Dashboard",
};

export default function TermsPage() {
  const effectiveDate = "December 26, 2025";

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl px-10 py-14">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <div className="text-xl font-bold text-slate-900">Terms and Conditions</div>
            <div className="text-xs text-slate-500">Effective date: {effectiveDate}</div>
          </div>

          <div className="text-sm text-slate-600 leading-6">
            These Terms and Conditions (“Terms”) govern your access to and use of the TMS Dashboard
            (the “Service”). By creating an account or using the Service, you agree to these Terms.
          </div>

          <div className="text-xs text-slate-500 leading-5">
            Note: These Terms are provided for general information and do not constitute legal advice.
            You should tailor them to your organization, product, and applicable laws.
          </div>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">1. Eligibility and accounts</div>
            <ul className="text-sm text-slate-600 leading-6 list-disc pl-5">
              <li>You must be legally able to form a binding contract to use the Service.</li>
              <li>You are responsible for maintaining the confidentiality of your credentials.</li>
              <li>You agree to provide accurate information and keep your account details up to date.</li>
              <li>
                If you use the Service on behalf of a company, you represent you have authority to
                bind that company.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">2. Roles, permissions, and company data</div>
            <div className="text-sm text-slate-600 leading-6">
              The Service may support roles (for example, admins and drivers). Access to data and
              features depends on role and permissions. You are responsible for the actions of users
              you invite or create within your company.
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">3. Acceptable use</div>
            <div className="text-sm text-slate-600 leading-6">You agree not to:</div>
            <ul className="text-sm text-slate-600 leading-6 list-disc pl-5">
              <li>Use the Service for unlawful, harmful, or fraudulent activities.</li>
              <li>Attempt to gain unauthorized access to accounts, systems, or data.</li>
              <li>Interfere with or disrupt the Service, including via automated abuse or scanning.</li>
              <li>Upload malicious code or content intended to compromise security.</li>
              <li>Reverse engineer the Service except where prohibited by law.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">4. Customer and operational content</div>
            <div className="text-sm text-slate-600 leading-6">
              You (or your company) retain ownership of data you input into the Service (such as
              customers, orders, stops, and driver details). You grant us a limited license to host,
              process, transmit, and display that data solely to operate and improve the Service.
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">5. Uploaded files</div>
            <div className="text-sm text-slate-600 leading-6">
              If the Service allows optional uploads (such as profile pictures), you confirm you have
              the rights to upload the file and that it does not violate applicable law or third-party
              rights.
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">6. Third-party services</div>
            <div className="text-sm text-slate-600 leading-6">
              The Service may rely on third-party providers (hosting, storage, monitoring). We are not
              responsible for third-party services outside our control, but we aim to use reputable
              providers consistent with the Privacy Policy.
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">7. Disclaimer</div>
            <div className="text-sm text-slate-600 leading-6">
              The Service is provided “as is” and “as available.” To the maximum extent permitted by
              law, we disclaim all warranties, express or implied, including merchantability, fitness for
              a particular purpose, and non-infringement.
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">8. Limitation of liability</div>
            <div className="text-sm text-slate-600 leading-6">
              To the maximum extent permitted by law, we will not be liable for indirect, incidental,
              special, consequential, or punitive damages, or any loss of profits, revenues, data, or
              goodwill arising from or related to your use of the Service.
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">9. Termination</div>
            <div className="text-sm text-slate-600 leading-6">
              We may suspend or terminate access if we reasonably believe you violated these Terms
              or if needed to protect the Service or other users. You may stop using the Service at any
              time.
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">10. Changes to these terms</div>
            <div className="text-sm text-slate-600 leading-6">
              We may update these Terms from time to time. Continued use of the Service after changes
              become effective means you accept the updated Terms.
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">11. Contact</div>
            <div className="text-sm text-slate-600 leading-6">
              For questions about these Terms, contact the service administrator for your organization
              or the operator of this Service.
            </div>
          </section>

          <div>
            <Link href="/register" className="text-[var(--primary-blue)] font-medium">
              Back to Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
