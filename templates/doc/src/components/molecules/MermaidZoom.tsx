'use client';
import {GithubControlButton} from '#/components/atoms/GithubControlButton';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {
  FiArrowDown,
  FiArrowLeft,
  FiArrowRight,
  FiArrowUp,
  FiCopy,
  FiMaximize2,
  FiMinus,
  FiPlus,
  FiRotateCcw,
  FiX,
} from 'react-icons/fi';
import {TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch';

interface InnerProps {
  children: React.ReactNode;
  isModal: boolean;
  onClose?: () => void;
  onExpand?: () => void;
}

type InstanceType = {
  transformState: {
    positionX: number;
    positionY: number;
    scale: number;
  };
};

function MermaidContent({children, isModal, onClose, onExpand}: InnerProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopy = useCallback(async () => {
    const text = containerRef.current?.innerText || '';
    if (text) {
      await navigator.clipboard.writeText(text);
    }
  }, []);

  return (
    <TransformWrapper initialScale={1} centerOnInit minScale={0.1} limitToBounds={false}>
      {({zoomIn, zoomOut, resetTransform, setTransform, instance}) => {
        const handlePan = (x: number, y: number): void => {
          const {positionX, positionY, scale} = (instance as unknown as InstanceType).transformState;
          setTransform(positionX + x, positionY + y, scale);
        };

        return (
          <div className="relative h-full w-full group">
            <div className="absolute right-4 top-4 z-20 flex gap-2">
              <GithubControlButton onClick={handleCopy} title="Copy code">
                <FiCopy size={14} />
              </GithubControlButton>
              {isModal ? (
                <GithubControlButton onClick={onClose} title="Close" className="hover:bg-red-500/10 hover:text-red-500">
                  <FiX size={16} />
                </GithubControlButton>
              ) : (
                <GithubControlButton onClick={onExpand} title="Full screen">
                  <FiMaximize2 size={14} />
                </GithubControlButton>
              )}
            </div>

            <div className="absolute right-4 bottom-4 z-20 grid grid-cols-3 gap-1 rounded-lg p-1.5 backdrop-blur-md border shadow-xl bg-white/50 dark:bg-[#161b22]/50 border-neutral-200 dark:border-neutral-700">
              <div />
              <GithubControlButton onClick={() => handlePan(0, 80)} title="Move up">
                <FiArrowUp size={14} />
              </GithubControlButton>
              <GithubControlButton onClick={() => zoomIn()} title="Zoom in">
                <FiPlus size={14} />
              </GithubControlButton>

              <GithubControlButton onClick={() => handlePan(80, 0)} title="Move left">
                <FiArrowLeft size={14} />
              </GithubControlButton>
              <GithubControlButton onClick={() => resetTransform()} title="Reset">
                <FiRotateCcw size={14} />
              </GithubControlButton>
              <GithubControlButton onClick={() => handlePan(-80, 0)} title="Move right">
                <FiArrowRight size={14} />
              </GithubControlButton>

              <div />
              <GithubControlButton onClick={() => handlePan(0, -80)} title="Move down">
                <FiArrowDown size={14} />
              </GithubControlButton>
              <GithubControlButton onClick={() => zoomOut()} title="Zoom out">
                <FiMinus size={14} />
              </GithubControlButton>
            </div>

            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
              }}
              contentStyle={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div ref={containerRef} className="mermaid-container p-10 cursor-grab active:cursor-grabbing">
                {children}
              </div>
            </TransformComponent>
          </div>
        );
      }}
    </TransformWrapper>
  );
}

export function MermaidZoom({children}: {children: React.ReactNode}): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true));
    return (): void => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return (): void => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  if (!isMounted) {
    return (
      <div className="my-8 w-full h-137.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#f6f8fa] dark:bg-[#0d1117] animate-pulse" />
    );
  }

  return (
    <>
      <div className="relative my-8 w-full overflow-hidden rounded-xl border h-137.5 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d1117]">
        <MermaidContent isModal={false} onExpand={() => setIsModalOpen(true)}>
          {children}
        </MermaidContent>
      </div>

      {isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-9999 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-8 flex items-center justify-center"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="relative w-full h-full max-w-[95vw] max-h-[95vh] bg-white dark:bg-[#0d1117] rounded-xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800"
              onClick={e => e.stopPropagation()}
            >
              <MermaidContent isModal onClose={() => setIsModalOpen(false)}>
                {children}
              </MermaidContent>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
