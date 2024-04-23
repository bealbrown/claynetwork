import React, { useState } from "react";

const Modal = ({ title, content, onClose }) => (
  <div className="modal-backdrop">
    <div className="modal">
      <button
        style={{
          color: "white",
          backgroundColor: "#222",
          width: "100px",
          marginTop: "30px",
        }}
        onClick={onClose}
      >
        Close
      </button>
      <h2>{title}</h2>
      <div
        style={{ overflow: "auto" }}
        dangerouslySetInnerHTML={{ __html: content }}
      ></div>
      <button
        style={{
          color: "white",
          backgroundColor: "#222",
          width: "100px",
          marginTop: "30px",
        }}
        onClick={onClose}
      >
        Close
      </button>
    </div>
  </div>
);

const FooterWithModals = () => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);

  const openTermsModal = () => setIsTermsOpen(true);
  const closeTermsModal = () => setIsTermsOpen(false);

  const openPolicyModal = () => setIsPolicyOpen(true);
  const closePolicyModal = () => setIsPolicyOpen(false);

  const tos_content = `<br><br><b> **Terms of Service for Clay Network** </b>

<br><br> © 2024 http://clay.network. All rights reserved. <br>
Contact Information: claynetwork@proton.me

<br><br> 


Welcome to Clay Network, an educational, non-profit website that displays information about the history of pottery and networks of individuals related to this field. By using our service, you agree to be bound by the following terms and conditions. 

<br><br><b> **1. Service Provision** </b><br><br>

Clay Network provides a free online tool intended for educational purposes only. We aim to offer insight into the history of pottery and connections among individuals within this domain. Our service is provided as is without any guarantees or warranties, express or implied. We reserve the right to modify or discontinue, temporarily or permanently, the service (or any part thereof) with or without notice. You agree that Clay Network shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the service.

<br><br><b> **2. Database and Content** </b><br><br>

The content displayed on Clay Network, including text, graphics, and images, is in constant flux due to ongoing research and updates. We compile information from various sources, including Wikipedia and images provided in thumbnail form, from elsewhere on the internet, as well as linked images, with original sources attributed. While we strive to provide accurate and up-to-date information, Clay Network makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of any information, products, services, or related graphics contained on the website for any purpose.

<br><br><b> **3. Intellectual Property Rights** </b><br><br>

The content provided on Clay Network is for personal and educational use only. 

<br><br><b> **4. User Data and Privacy** </b><br><br>

Clay Network is committed to protecting your privacy. We do not store, share, or sell any personal data of our users. 

<br><br><b> **5. Complaints and Contact Information** </b><br><br>

If you have any concerns or complaints about our service, please feel free to contact us at claynetwork@proton.me. We value your feedback and will make reasonable efforts to address your concerns. 

<br><br><b>6. Representations and Warranties; Indemnification; Limitation of Liabilities </b>

<br><br>**6.1 Representations and Covenants:** You affirm, guarantee, and pledge the following: (1) any content or material you engage with through our services will not: (a) infringe upon the rights, including copyright, trademark, privacy, or other personal or proprietary rights, of any third party, nor (b) contain libelous, defamatory, or otherwise unlawful material; (2) you meet the age requirement of at least thirteen years in the USA and the UK, and sixteen years old in other jurisdictions; (3) for users under eighteen years old, your parent or legal guardian has consented to these Terms of Service and approved your use of the Services. 

You agree to indemnify, defend, and hold harmless Clay Network and its officers, directors, employees, agents, affiliates, licensors, and licensees (collectively, "Indemnified Parties") from any liability, loss, claim, and expense, including reasonable attorney's fees, related to your violation of these Terms or use of the Services.

<br><br>**6.2 No Endorsements and Reliability of Information:** Clay Network does not endorse or guarantee the reliability, accuracy, or truthfulness of any advice, opinion, statement, or other information displayed, uploaded, or distributed through the Services by any user, information provider, or any other entity. Your interaction with the Services and reliance on any such information is at your sole risk. The services are provided "as is" without warranties of any kind, either express or implied, including, without limitation, warranties of title or fitness for a particular purpose. Clay Network does not guarantee uninterrupted service or error-free operation of the Services. Content may include inaccuracies or errors, and should not be the sole basis for any professional decisions. Always seek direct advice from professionals in relevant fields.

<br><br>**6.3 Limitation of Liability:** In no event shall Clay Network, its affiliates, or their respective directors, officers, employees, or licensors be liable for any indirect, consequential, special, incidental, punitive, or exemplary damages arising from your use of the Services or for any other claim related in any way to your use of the Services. This limitation applies regardless of the theory of liability and even if Clay Network has been advised of the possibility of such damages. In jurisdictions that do not allow the exclusion or limitation of certain damages, Clay Network's liability shall be limited to the extent permitted by law.

<br><br><b> **7. Changes to Terms of Service** </b><br><br>

We reserve the right, at our sole discretion, to modify or replace these Terms of Service at any time. By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms.

<br><br><b> **8. Governing Law** </b><br><br>

These Terms shall be governed and construed in accordance with the laws of the USA, without regard to its conflict of law provisions.

By using Clay Network, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.

Clay Network is a non-profit initiative aimed at educational purposes, and we thank you for your interest and support in spreading the knowledge of pottery history. `;

  const copyright_content = `

<br>© 2024 http://clay.network. All rights reserved.
<br>Contact Information: claynetwork@proton.me
<br>
<br>
Clay Network is committed to respecting copyrights and intellectual property rights. Our website serves as a nonprofit, educational resource designed to support and enhance learning and knowledge sharing. The content on our website, including text and multimedia resources, is primarily derived from Wikipedia and is made available under the Creative Commons Attribution-ShareAlike License. Please visit the Wikipedia website for more information on their copyright and licensing policies.
<br>
<br><b>### Image Use Policy</b><br>
<br>
The images displayed as thumbnails on our website are obtained through automated processes, similar to the functionality provided by Google Image Search. These images are presented in a reduced size (400x400 pixels) for educational and informational purposes, with the intent of falling under the "fair use" doctrine as per United States copyright law. Each thumbnail <br>image directly links to its original source and attributes the original content creators, aligning with our commitment to honor copyright and intellectual property rights.
<br>
<br><b>### Request for Image Removal</b><br>
<br>
We understand and respect the rights of content creators and copyright holders. If you are the copyright owner of an image displayed on our website and wish for it to be removed, we <br>kindly ask you to reach out to us directly. Please provide us with the following information in your request:
<br>
<br>- Your name and contact information.
<br>- The URL of the image in question on our website.
<br>- Proof of copyright ownership or authority to act on behalf of the copyright owner.
<br>- A statement confirming that the information provided in the request is accurate.
<br>
<br>Upon receipt of a valid removal request, we will promptly remove the specified image(s) from our website and ensure that similar issues are prevented in the future.
<br>
<br><b>### Contact Information</b><br>
<br>
<br>For image removal requests or any copyright-related inquiries, please contact us at:
<br>
<br>claynetwork@proton.me
<br>
<br>We appreciate your cooperation and understanding as we strive to respect copyright and intellectual property rights while providing a valuable educational resource to our users.
Clay Network endeavors to comply with all applicable laws and regulations regarding copyright and intellectual property. We reserve the right to update this policy at any time without <br>prior notice. 
<br>
<br>This policy was last updated on Apr 23 2024.`;

  return (
    <div className="footer">
      <a href="#!" onClick={openTermsModal}>
        Terms of Service{"    "}
      </a>
      {"    "}|
      <a href="#!" onClick={openPolicyModal}>
        Copyright Policy
      </a>
      {isTermsOpen && (
        <Modal
          title="Terms of Service"
          content={tos_content}
          onClose={closeTermsModal}
        />
      )}
      {isPolicyOpen && (
        <Modal
          title="Clay Network Copyright Policy"
          content={copyright_content}
          onClose={closePolicyModal}
        />
      )}
    </div>
  );
};

export default FooterWithModals;
