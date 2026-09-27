import { useRef } from "react";
import { Upload, FileImage, FileVideo, X } from "lucide-react";

function FileUploader({ inputType, file, onFileChange }) {
  const inputRef = useRef(null);

  const isImage = inputType === "image";

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      onFileChange(selectedFile);
    }
  };

  const removeFile = () => {
    onFileChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <section className="file-uploader">
      <div className="section-heading">
        <span>{isImage ? "Image Input" : "Video Input"}</span>
        <h2>Upload {isImage ? "Currency Image" : "Currency Video"}</h2>
      </div>

      {!file ? (
        <button
          type="button"
          className="upload-box"
          onClick={() => inputRef.current?.click()}
        >
          <div className="upload-icon">
            {isImage ? <FileImage size={30} /> : <FileVideo size={30} />}
          </div>

          <h3>Choose {isImage ? "an image" : "a video"}</h3>

          <p>
            Click to browse your computer or drag and drop your file here
          </p>

          <span className="upload-button">
            <Upload size={18} />
            Browse File
          </span>
        </button>
      ) : (
        <div className="selected-file">
          <div className="selected-file-icon">
            {isImage ? <FileImage size={24} /> : <FileVideo size={24} />}
          </div>

          <div className="selected-file-info">
            <h3>{file.name}</h3>
            <p>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>

          <button
            type="button"
            className="remove-file"
            onClick={removeFile}
            aria-label="Remove file"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={isImage ? "image/*" : "video/*"}
        onChange={handleFileChange}
        hidden
      />
    </section>
  );
}

export default FileUploader;