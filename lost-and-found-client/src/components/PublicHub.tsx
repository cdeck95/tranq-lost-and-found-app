import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EnterLostDisc from './EnterLostDisc';
import Inventory from './Inventory';
import '../styles/App.css';
import { Button, ButtonGroup, Typography, useMediaQuery, useTheme } from '@mui/material'; // Import Button and ButtonGroup from MUI
import PublicInventory from './PublicInventory';


function PublicHub() {

  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up("md"));


  return (
    <div className="App">
      <header className="App-header">
        <Typography sx={{ color: 'white', fontSize: isMobile? "2rem" : "3rem"}}>Tranquility Trails Lost and Found</Typography>      </header>
      <main className="container">
        <PublicInventory />
      </main>
    </div>
  );
}

    
export default PublicHub;