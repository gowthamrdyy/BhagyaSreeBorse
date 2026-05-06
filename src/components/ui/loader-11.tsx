"use client";
import React from 'react';
import styled from 'styled-components';
import { createPortal } from "react-dom";

const Loader = ({ isActive }: { isActive: boolean }) => {
    if (!isActive) return null;

    // Use Portal to overlay on top of everything
    // Accessing document only on client
    if (typeof window === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[10000] bg-black flex items-center justify-center">
            <StyledWrapper>
                <div className="sharingon">
                    <div className="ring">
                        <div className="to" />
                        <div className="to" />
                        <div className="to" />
                        <div className="circle" />
                    </div>
                </div>
            </StyledWrapper>
        </div>,
        document.body
    );
}

const StyledWrapper = styled.div`
  .sharingon {
    width: 12em; /* Increased size for full screen impact */
    height: 12em;
    background-color: red;
    border: 6px solid black;
    animation: rot 1s ease-in-out infinite;
  }

  .ring {
    position: absolute;
    content: "";
    left: 50%;
    top: 50%;
    width: 7em; /* Scaled */
    height: 7em; /* Scaled */
    border: 8px solid rgb(110, 13 ,13 ,0.5);
    transform: translate(-50%,-50%);
  }

  .sharingon, .ring, .to,.circle {
    border-radius: 50%;
  }

  .to,.circle {
    position: absolute;
    content: "";
    width: 1.8em; /* Scaled */
    height: 1.8em; /* Scaled */
    background-color: black;
  }

  .to:nth-child(1) {
    top: -1em;
    left: 50%;
    transform: translate(-40%);
  }

  .to::before {
    content: "";
    position: absolute;
    top: -1em;
    right: -0.4em;
    width: 2.2em;
    height: 1.8em;
    box-sizing: border-box;
    border-left: 32px solid black;
    border-radius: 100% 0 0;
  }

  .to:nth-child(2) {
    bottom: 1em;
    left: -0.7em;
    transform: rotate(-120deg);
  }

  .to:nth-child(3) {
    bottom: 1em;
    right: -0.7em;
    transform: rotate(120deg);
  }

  .circle {
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    box-shadow: 0 0 20px 1px;
    width: 2em;
    height: 2em;
  }

  @keyframes rot {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }`;

export default Loader;
