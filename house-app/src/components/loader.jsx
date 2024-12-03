import { BounceLoader } from "react-spinners";

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
          backgroundColor: "#fff",
        }}
      >
        <BounceLoader
          color="var(--main-color)"
          cssOverride={{ position: "absolute", top: "40%", left: "50%" }}
          loading={loading}
          size={70}
          speedMultiplier={1}
        />
      </div>
    </>
  );
}

