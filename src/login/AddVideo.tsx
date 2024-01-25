import React, { useEffect, useState, useRef } from 'react';
import { Html } from '@react-three/drei';
import './AddVideo.css';
import { Button, IconButton, TextField, FormControl, InputLabel, MenuItem } from '@mui/material';
import { ArrowBack, FileUpload } from '@mui/icons-material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import axios from 'axios';

enum PageState {
    Main,
    AddVideo,
    EditProfile,
    Login,
    Join
}


type AddVideoProps = {
    position: [number, number, number];
    onChangePage: (newPage: PageState) => void;
};

const AddVideo: React.FC<AddVideoProps> = ({ position, onChangePage }) => {

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const userEmail = localStorage.getItem('loginMail') || sessionStorage.getItem('loginMail');

  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  const handleArtist = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArtist(e.target.value);
  };

  useEffect(() => {
    if (videoFile) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setVideoPreview(fileReader.result as string);
      };
      fileReader.readAsDataURL(videoFile);
    } else {
      setVideoPreview(null);
    }
  }, [videoFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setVideoFile(files[0]);
    }
  };

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedTag(event.target.value);
  };

  const handleUpload = async () => {
    try {
      // videoFile이 없거나 필수 정보가 입력되지 않은 경우 업로드를 수행하지 않음
      if (!videoFile || !title || !artist || !selectedTag) {
        console.error('Please select a video file and fill in all required fields.');
        return;
      }

      const formData = new FormData();
      formData.append('video', videoFile); // 'video' 필드명으로 파일을 추가

      // 추가 정보를 FormData에 추가
      formData.append('title', title);
      formData.append('artist', artist);
      formData.append('selectedTag', selectedTag);

      const response = await axios.post('http://172.10.7.58:80/contents/uploadVideo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      console.log(videoUrl);

      // 서버에서 반환한 동영상 URL을 상태에 저장
      setVideoUrl(response.data?.videoUrl || null);
      // setVideoUrls((prevVideoUrls) => [...prevVideoUrls, response.data?.videoUrl || null]);
      // contentsId를 서버에 전달하여 컨텐츠 저장
      const contentsId = response.data?.contentsId;

      const formData2 = new FormData();
      formData2.append('email', userEmail || '');
      formData2.append('contentsId', contentsId);
      console.log(userEmail);
      console.log(contentsId);
      if (contentsId) {
        await axios.post('http://172.10.7.58:80/contents/postmycontents', formData2, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
      }
      alert("Video Uploaded!"); 
      onChangePage(PageState.Main);
    } catch (error) { 
      alert("Video Upload failed!");
      console.error('Error uploading videos:', error);
    }
  };

  return (
    <Html position={position} style={{ transform: "translate(-50%, -58%)" }}>
        <div className="UV">
            <div className="UVtop">
                <h2>Upload Video</h2>
            </div>
            <div className="UVbody">
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="video/*"
                    onChange={handleFileChange}
                />
                <div className='videoselect'>
                    {videoPreview ? (
                        <video src={videoPreview} controls />
                    ) : (
                        <img src='/images/blankvideo.jpg' alt='No video selected' />
                    )}
                    <Button variant="text" onClick={() => fileInputRef.current?.click()} className='SVbutton' style={{color: "orangered", fontFamily: "Bold"}}>Select Video</Button>
                </div>
                
                <div className='UVprofile'>
                    <TextField label="Title" variant="outlined" className="tf" onInput={handleTitle} />
                    <TextField label="Artist" variant="outlined" className="tf" onInput={handleArtist} />
                </div>
            </div>
            <div className='UVbottom'>
              <FormControl className="select-standard">
                <InputLabel id="demo-simple-select-standard-label" style={{color: "white"}}>Genre</InputLabel>
                <Select
                    labelId="demo-simple-select-standard-label"
                    id="demo-simple-select-standard"
                    value={selectedTag}
                    onChange={handleChange}
                    label="Genre"
                    MenuProps={{
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left"
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left"
                      },
                    }}
                >
                <MenuItem className="custom-menu-item" value={"기타"}>Guitar</MenuItem>
                <MenuItem className="custom-menu-item" value={"키보드"}>Keyboard</MenuItem>
                <MenuItem className="custom-menu-item" value={"드럼"}>Drum</MenuItem>
                <MenuItem className="custom-menu-item" value={"베이스"}>Bass</MenuItem>
                <MenuItem className="custom-menu-item" value={"밴드"}>Band</MenuItem>
                </Select>
              </FormControl>
              
              <Button variant="outlined" startIcon={<FileUpload />} onClick={handleUpload} className='ub' style={{color:"orangered", borderColor:"orangered", fontFamily: "Bold", zIndex: '1'}}>
                  Upload
              </Button>
            </div>
        </div>
        <IconButton aria-label="editprofile" onClick={() => onChangePage(PageState.Main)} style={{ color: "#FFFFFF", marginRight: '3%', position: 'absolute', left: '3%', top: '-1%' }}>
            <ArrowBack />
        </IconButton>
    </Html>
  );
};

export default AddVideo;