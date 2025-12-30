import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - TMS Dashboard",
};

export default function PrivacyPage() {
  const effectiveDate = "December 26, 2025";

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl px-10 py-14">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <div className="text-xl font-bold text-slate-900">Privacy Policy</div>
            <div className="text-xs text-slate-500">Effective date: {effectiveDate}</div>
          </div>

          <div className="text-sm text-slate-600 leading-6">
            This Privacy Policy explains how the TMS Dashboard (the “Service”) collects, uses, and
            shares information when you create an account, create a company, and manage
            transportation operations (e.g., users/drivers, customers, orders, stops, trucks, trailers).
          </div>

          <div className="text-xs text-slate-500 leading-5">
            Note: This policy is provided for general information and does not constitute legal advice.
            You should tailor it to your organization, data flows, and applicable laws.
          </div>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">1. Information we collect</div>
            <div className="text-sm text-slate-600 leading-6">We collect information in three ways:</div>
            <ul className="text-sm text-slate-600 leading-6 list-disc pl-5">
              <li>
                <span className="font-semibold text-slate-900">Information you provide:</span> account
                details (name, email, password), phone number (where applicable), company information,
                and operational data you enter (customers, orders, stops, etc.).
              </li>
              <li>
                <span className="font-semibold text-slate-900">Files you upload:</span> profile images
                (avatar) if you choose to upload one.
              </li>
              <li>
                <span className="font-semibold text-slate-900">Information collected automatically:</span>
                basic usage and technical data such as device/browser type, log data, approximate
                location derived from IP address, and activity within the Service to help keep it secure
                and operating.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">2. How we use information</div>
            <div className="text-sm text-slate-600 leading-6">We use information to:</div>
            <ul className="text-sm text-slate-600 leading-6 list-disc pl-5">
              <li>Create and manage accounts and authenticate users.</li>
              <li>Provide the core Service features (dispatch and fleet management).</li>
              <li>Maintain safety, security, and prevent fraud/abuse.</li>
              <li>Communicate with you about service-related notices.</li>
              <li>Troubleshoot, debug, and improve performance and reliability.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">3. Legal bases (where applicable)</div>
            <div className="text-sm text-slate-600 leading-6">
              Depending on your location, our legal bases may include performance of a contract
              (providing the Service you request), legitimate interests (security and improvement),
              compliance with legal obligations, and consent (for optional uploads/features).
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">4. How we share information</div>
            <div className="text-sm text-slate-600 leading-6">
              We do not sell personal information. We may share information:
            </div>
            <ul className="text-sm text-slate-600 leading-6 list-disc pl-5">
              <li>
                <span className="font-semibold text-slate-900">With service providers</span> that help
                us run the Service (hosting, databases, file storage for uploaded images, monitoring).
                They are permitted to process data only to provide services to us.
              </li>
              <li>
                <span className="font-semibold text-slate-900">Within your organization</span> (e.g.,
                company admins and drivers) according to roles and permissions.
              </li>
              <li>
                <span className="font-semibold text-slate-900">For legal reasons</span> if required to
                comply with law, enforce our terms, or protect rights, safety, and security.
              </li>
              <li>
                <span className="font-semibold text-slate-900">Business transfers</span> in connection
                with a merger, acquisition, or sale of assets.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">5. Cookies and similar technologies</div>
            <div className="text-sm text-slate-600 leading-6">
              We may use cookies or similar technologies for authentication and to remember your
              preferences. Your browser settings may allow you to control cookies; some features may
              not work properly without them.
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">6. Data retention</div>
            <div className="text-sm text-slate-600 leading-6">
              We keep information as long as necessary to provide the Service, comply with legal
              obligations, resolve disputes, and enforce agreements. Retention periods may vary based
              on the type of data and how it is used.
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">7. Security</div>
            <div className="text-sm text-slate-600 leading-6">
              We implement reasonable administrative, technical, and organizational safeguards.
              However, no method of transmission or storage is 100% secure.
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">8. Your rights and choices</div>
            <div className="text-sm text-slate-600 leading-6">
              Depending on your location, you may have rights to access, correct, delete, object to
              processing, or request portability of your personal information. You can also update some
              information in the Service.
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">9. International data transfers</div>
            <div className="text-sm text-slate-600 leading-6">
              Your information may be processed in countries other than where you live. Where required,
              we use appropriate safeguards for cross-border transfers.
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">10. Children’s privacy</div>
            <div className="text-sm text-slate-600 leading-6">
              The Service is not intended for children under 13 (or the minimum age required in your
              jurisdiction). We do not knowingly collect personal information from children.
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">11. Changes to this policy</div>
            <div className="text-sm text-slate-600 leading-6">
              We may update this policy from time to time. If we make material changes, we will provide
              notice within the Service or by other reasonable means.
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-900">12. Contact</div>
            <div className="text-sm text-slate-600 leading-6">
              If you have questions about this Privacy Policy or privacy practices, contact the service
              administrator for your organization or the operator of this Service.
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
