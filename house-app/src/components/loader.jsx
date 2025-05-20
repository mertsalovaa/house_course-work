import { BounceLoader } from "react-spinners";
import { colors } from "../assets/colors";

export default function Loader({loading}) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          zIndex: "1003",
          width: "100%",
          minHeight: "100vh",
          display: !loading ? "none" : "flex",
          alignItems: "center",
          backgroundColor: "#ffffff89",
        }}
      >
        <BounceLoader
          color={colors.main}
          cssOverride={{ position: "absolute", top: "40%", left: "50%" }}
          loading={loading}
          size={70}
          speedMultiplier={1}
        />
      </div>
    </>
  );
}

