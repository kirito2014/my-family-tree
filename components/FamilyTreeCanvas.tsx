'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Move, ZoomIn, ZoomOut } from 'lucide-react';

interface Member {
  id: string;
  firstName: string;
  lastName?: string;
  x: number;
  y: number;
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
  type: string;
}

export const FamilyTreeCanvas: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([
    { id: '1', firstName: '张三', x: 100, y: 100 },
    { id: '2', firstName: '李四', x: 300, y: 100 },
    { id: '3', firstName: '王五', x: 200, y: 200 },
  ]);

  const [connections, setConnections] = useState<Connection[]>([
    { id: '1', fromId: '1', toId: '3', type: 'parent' },
    { id: '2', fromId: '2', toId: '3', type: 'parent' },
  ]);

  const [viewState, setViewState] = useState({ scale: 1, offsetX: 0, offsetY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - viewState.offsetX, y: e.clientY - viewState.offsetY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setViewState({
        ...viewState,
        offsetX: e.clientX - dragStart.x,
        offsetY: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setViewState({
      ...viewState,
      scale: Math.max(0.1, Math.min(5, viewState.scale * delta)),
    });
  };

  const handleMemberDragStart = (id: string, e: React.MouseEvent) => {
    setSelectedMember(id);
    e.stopPropagation();
  };

  const handleMemberDrag = (id: string, e: React.MouseEvent) => {
    if (selectedMember === id) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        setMembers(members.map(member => {
          if (member.id === id) {
            return {
              ...member,
              x: Math.round((e.clientX - canvasRect.left - viewState.offsetX) / viewState.scale),
              y: Math.round((e.clientY - canvasRect.top - viewState.offsetY) / viewState.scale),
            };
          }
          return member;
        }));
      }
    }
  };

  const handleMemberDragEnd = () => {
    setSelectedMember(null);
  };

  const addMember = () => {
    const newMember: Member = {
      id: Date.now().toString(),
      firstName: `新成员${members.length + 1}`,
      x: 200,
      y: 100 + members.length * 100,
    };
    setMembers([...members, newMember]);
  };

  const zoomIn = () => {
    setViewState({
      ...viewState,
      scale: Math.min(5, viewState.scale * 1.2),
    });
  };

  const zoomOut = () => {
    setViewState({
      ...viewState,
      scale: Math.max(0.1, viewState.scale * 0.8),
    });
  };

  const resetView = () => {
    setViewState({ scale: 1, offsetX: 0, offsetY: 0 });
  };

  return (
    <div className="relative">
      {/* 控制栏 */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 bg-white p-2 rounded-lg shadow-md">
        <button
          onClick={addMember}
          className="p-2 rounded hover:bg-gray-100"
          title="添加成员"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={zoomIn}
          className="p-2 rounded hover:bg-gray-100"
          title="放大"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={zoomOut}
          className="p-2 rounded hover:bg-gray-100"
          title="缩小"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={resetView}
          className="p-2 rounded hover:bg-gray-100"
          title="重置视图"
        >
          <Move size={16} />
        </button>
      </div>

      {/* 画布 */}
      <div
        ref={canvasRef}
        className="family-tree-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <div
          className="relative"
          style={{
            transform: `translate(${viewState.offsetX}px, ${viewState.offsetY}px) scale(${viewState.scale})`,
            transformOrigin: '0 0',
            width: '2000px',
            height: '2000px',
          }}
        >
          {/* 连接线 */}
          <svg
            className="absolute top-0 left-0 w-full h-full"
            style={{ pointerEvents: 'none' }}
          >
            {connections.map((connection) => {
              const fromMember = members.find((m) => m.id === connection.fromId);
              const toMember = members.find((m) => m.id === connection.toId);

              if (!fromMember || !toMember) return null;

              return (
                <path
                  key={connection.id}
                  d={`M ${fromMember.x + 60} ${fromMember.y + 40} Q ${(fromMember.x + toMember.x) / 2 + 60} ${(fromMember.y + toMember.y) / 2} ${toMember.x} ${toMember.y + 40}`}
                  className="family-tree-connection"
                />
              );
            })}
          </svg>

          {/* 成员节点 */}
          {members.map((member) => (
            <div
              key={member.id}
              className={`family-tree-node ${selectedMember === member.id ? 'ring-2 ring-blue-500' : ''}`}
              style={{
                left: `${member.x}px`,
                top: `${member.y}px`,
              }}
              onMouseDown={(e) => handleMemberDragStart(member.id, e)}
              onMouseMove={(e) => handleMemberDrag(member.id, e)}
              onMouseUp={handleMemberDragEnd}
              onMouseLeave={handleMemberDragEnd}
            >
              <h3 className="font-medium">{member.firstName}</h3>
              {member.lastName && <p className="text-sm text-gray-500">{member.lastName}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
