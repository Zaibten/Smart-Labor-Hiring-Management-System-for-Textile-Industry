import React, { useRef, useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SignatureScreen from "react-native-signature-canvas";
import ChatBot from "../components/ChatBot";

const contractorTabs = [
  { label: "Home", icon: "home" },
  { label: "Create Jobs", icon: "add-circle" },
  { label: "All Jobs", icon: "list" },
  { label: "Chats", icon: "chatbubbles" },
  { label: "Settings", icon: "settings" },
];

const Contractor: React.FC = () => {
  const [fromCompany, setFromCompany] = useState("");
  const [toCompany, setToCompany] = useState("");
  const [partyType, setPartyType] = useState("Labour");
  const [description, setDescription] = useState("");
  const [showContract, setShowContract] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [labourSignature, setLabourSignature] = useState<string | null>(null);
  const [contractorSignature, setContractorSignature] = useState<string | null>(
    null,
  );

  const labourRef = useRef<any>(null);
  const contractorRef = useRef<any>(null);

  // Signature pad style for proper touch and drag drawing
  const signatureWebStyle = `.m-signature-pad {
    position: relative;
    font-size: 10px;
    width: 100%;
    height: 100%;
    background-color: #fff;
    border-radius: 8px;
  }
  .m-signature-pad--body {
    position: relative;
    flex: 1;
    border: 2px solid #cbd5e1;
    border-radius: 8px;
    background-color: #fff;
    touch-action: none;
  }
  .m-signature-pad--body canvas {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    touch-action: none;
    cursor: crosshair;
  }
  .m-signature-pad--footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    gap: 10px;
  }
  .m-signature-pad--footer .description {
    color: #666;
    font-size: 12px;
    font-style: italic;
  }
  .m-signature-pad--footer .button {
    background-color: #1e3a8a;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .m-signature-pad--footer .button.clear {
    background-color: #dc2626;
  }
  .m-signature-pad--footer .button.clear:hover {
    background-color: #b91c1c;
  }
  .m-signature-pad--footer .button.save:hover {
    background-color: #1e40af;
  }
  button {
    font-family: Arial, sans-serif;
  }
  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }`;

  const downloadPDF = () => {
    if (Platform.OS === "web") {
      const content = document.getElementById("contractContent")?.innerHTML;
      const myWindow = window.open("", "Print", "width=800,height=600");
      myWindow?.document.write(`
        <html>
          <head>
            <title>Contract</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .section { font-weight: bold; margin-top: 15px; }
              .bold { font-weight: bold; }
              .signatureBox { border: 1px solid #000; padding: 10px; height: 200px; margin-top: 20px; }
              .centerText { text-align: center; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `);
      myWindow?.document.close();
      myWindow?.focus();
      myWindow?.print();
    } else {
      alert("PDF generation is only supported on web in this version.");
    }
  };

  const handleLabourSignature = (signature: string) => {
    setLabourSignature(signature);
  };

  const handleContractorSignature = (signature: string) => {
    setContractorSignature(signature);
  };

  const clearLabourSignature = () => {
    setLabourSignature(null);
    // Clear the signature pad canvas
    if (labourRef.current) {
      labourRef.current.clearSignature();
    }
  };

  const clearContractorSignature = () => {
    setContractorSignature(null);
    // Clear the signature pad canvas
    if (contractorRef.current) {
      contractorRef.current.clearSignature();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f1f5f9" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* FORM CARD */}
        <View style={styles.card}>
          <Text style={styles.heading}>Digital Contract Generator</Text>
          <Text style={styles.subText}>
            Labour Hub – Professional Labour & Contractor Agreement System
          </Text>

          <Text style={styles.label}>From Company / Industry</Text>
          <TextInput
            value={fromCompany}
            onChangeText={setFromCompany}
            style={styles.input}
            placeholder="Enter company name"
          />

          <Text style={styles.label}>To Company / Contractor</Text>
          <TextInput
            value={toCompany}
            onChangeText={setToCompany}
            style={styles.input}
            placeholder="Enter company name"
          />

          <Text style={styles.label}>Agreement Category</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <Text>{partyType}</Text>
          </TouchableOpacity>
          {dropdownOpen && (
            <View style={styles.dropdownOptions}>
              {["Labour", "Contractor"].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.option}
                  onPress={() => {
                    setPartyType(item);
                    setDropdownOpen(false);
                  }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Work Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { height: 120 }]}
            multiline
            placeholder="Describe the work"
          />

          <TouchableOpacity
            onPress={() => setShowContract(true)}
            style={styles.button}
          >
            <Text style={{ color: "#fff" }}>Preview Contract</Text>
          </TouchableOpacity>
        </View>
        <ChatBot />

        {/* CONTRACT MODAL */}
        <Modal visible={showContract} animationType="slide">
          <ScrollView style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setShowContract(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>✕ Close</Text>
            </TouchableOpacity>

            <View style={styles.contract} id="contractContent">
              <Text style={styles.pdfHeader}>LABOUR HUB</Text>
              <Text style={styles.centerText}>
                Official Labour & Contractor Agreement
              </Text>

              <View style={styles.infoTable}>
                <Text>
                  <Text style={styles.bold}>From Company:</Text> {fromCompany}
                </Text>
                <Text>
                  <Text style={styles.bold}>To Company:</Text> {toCompany}
                </Text>
                <Text>
                  <Text style={styles.bold}>Agreement Type:</Text> {partyType}
                </Text>
              </View>

              <Text style={styles.section}>1. Scope of Work</Text>
              <Text>{description}</Text>

              <Text style={styles.section}>2. Responsibilities</Text>
              <Text>
                The service provider shall comply with labour laws, safety
                policies, and professional conduct requirements.
              </Text>

              <Text style={styles.section}>3. Payment Terms</Text>
              <Text>
                Payments shall be processed as mutually agreed. Labour Hub holds
                no responsibility for payment disputes.
              </Text>

              <Text style={styles.section}>4. Confidentiality</Text>
              <Text>
                All business and operational information shall remain strictly
                confidential.
              </Text>

              <Text style={styles.section}>5. Termination</Text>
              <Text>
                Either party may terminate this agreement with written notice
                upon violation of terms.
              </Text>

              <Text style={styles.section}>6. Governing Law</Text>
              <Text>
                This agreement shall be governed under the laws of Pakistan.
              </Text>

              <Text style={styles.section}>7. Digital Acceptance</Text>
              <Text>
                This document is legally binding upon digital confirmation.
              </Text>

              {/* Labour Signature Section */}
              <View style={styles.signatureWrapper}>
                <Text style={styles.signatureLabel}>Labour Signature</Text>
                <Text style={styles.signatureHint}>
                  Tap and drag to draw your signature
                </Text>
                <View style={styles.signatureContainer}>
                  {!labourSignature ? (
                    <View style={styles.signaturePadContainer}>
                      <SignatureScreen
                        ref={labourRef}
                        onOK={handleLabourSignature}
                        onEmpty={() => alert("Please provide Labour signature")}
                        descriptionText="Draw your signature here"
                        clearText="Clear"
                        confirmText="Save"
                        webStyle={signatureWebStyle}
                        autoClear={false}
                        imageType="image/png"
                        penColor="black"
                        backgroundColor="#ffffff"
                        minWidth={2}
                        maxWidth={4}
                      />
                    </View>
                  ) : (
                    <View style={styles.savedSignatureContainer}>
                      <Text style={styles.savedText}>✓ Signature Saved</Text>
                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={clearLabourSignature}
                      >
                        <Text style={styles.clearButtonText}>
                          Draw New Signature
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {/* Contractor Signature Section */}
              <View style={styles.signatureWrapper}>
                <Text style={styles.signatureLabel}>Contractor Signature</Text>
                <Text style={styles.signatureHint}>
                  Tap and drag to draw your signature
                </Text>
                <View style={styles.signatureContainer}>
                  {!contractorSignature ? (
                    <View style={styles.signaturePadContainer}>
                      <SignatureScreen
                        ref={contractorRef}
                        onOK={handleContractorSignature}
                        onEmpty={() =>
                          alert("Please provide Contractor signature")
                        }
                        descriptionText="Draw your signature here"
                        clearText="Clear"
                        confirmText="Save"
                        webStyle={signatureWebStyle}
                        autoClear={false}
                        imageType="image/png"
                        penColor="black"
                        backgroundColor="#ffffff"
                        minWidth={2}
                        maxWidth={4}
                      />
                    </View>
                  ) : (
                    <View style={styles.savedSignatureContainer}>
                      <Text style={styles.savedText}>✓ Signature Saved</Text>
                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={clearContractorSignature}
                      >
                        <Text style={styles.clearButtonText}>
                          Draw New Signature
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.footer}>
                <View>
                  <Text style={styles.bold}>Labour Hub</Text>
                  <Text>Email: fyplabourhub@gmail.com</Text>
                  <Text>Contact: 0334-112212</Text>
                  <Text>Date: {new Date().toLocaleDateString()}</Text>
                  <Text>Digitally Generated Contract</Text>
                </View>
              </View>

              <TouchableOpacity onPress={downloadPDF} style={styles.button}>
                <Text style={{ color: "#fff" }}>Download PDF</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>
      </ScrollView>
    </View>
  );
};

export default Contractor;

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  heading: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 5,
  },
  subText: { textAlign: "center", color: "#475569", marginBottom: 15 },
  label: { fontWeight: "bold", marginTop: 10, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
  },
  dropdownOptions: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    marginTop: 2,
    backgroundColor: "#fff",
  },
  option: { padding: 10 },
  button: {
    backgroundColor: "#1e3a8a",
    padding: 14,
    marginTop: 20,
    borderRadius: 6,
    alignItems: "center",
  },
  modalContainer: { flex: 1, padding: 20, backgroundColor: "#f1f5f9" },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  closeText: { fontSize: 16, color: "#1e3a8a", fontWeight: "bold" },
  contract: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  pdfHeader: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  centerText: { textAlign: "center", marginBottom: 20 },
  infoTable: { marginBottom: 20 },
  bold: { fontWeight: "bold" },
  section: { marginTop: 15, fontWeight: "bold", fontSize: 16 },
  signatureWrapper: {
    marginTop: 25,
    marginBottom: 10,
  },
  signatureLabel: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    color: "#1e3a8a",
  },
  signatureHint: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
    fontStyle: "italic",
  },
  signatureContainer: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  signaturePadContainer: {
    height: 250,
    width: "100%",
    backgroundColor: "#fff",
  },
  savedSignatureContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  savedText: {
    fontSize: 16,
    color: "#10b981",
    fontWeight: "600",
    marginBottom: 12,
  },
  clearButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  tabWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
