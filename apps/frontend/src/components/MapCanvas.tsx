import React, { useEffect, useRef, useState } from 'react';
import { CanvasRenderer } from '../utils/canvas/CanvasRenderer';
import { CanvasInteractionHandler } from '../utils/canvas/CanvasInteractionHandler';
import { GridLayer } from '../utils/canvas/layers/GridLayer';
import { VehicleLayer } from '../utils/canvas/layers/VehicleLayer';
import { PathLayer } from '../utils/canvas/layers/PathLayer';
import { useVehicleStore } from '../stores/vehicle.store';

interface MapCanvasProps {
  width?: number | string;
  height?: number | string;
  showGrid?: boolean;
  showPaths?: boolean;
  onVehicleSelect?: (vehicleId: string | null) => void;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  width = '100%',
  height = '600px',
  showGrid = true,
  showPaths = true,
  onVehicleSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const interactionRef = useRef<CanvasInteractionHandler | null>(null);
  const vehicleLayerRef = useRef<VehicleLayer | null>(null);

  const { vehicles, positions, runtimeStates, selectedVehicleId, setSelectedVehicleId } =
    useVehicleStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || isInitialized) return;

    const canvas = canvasRef.current;
    const renderer = new CanvasRenderer(canvas);
    rendererRef.current = renderer;

    // Create layers
    const gridLayer = new GridLayer({
      gridSize: 1,
      majorGridSize: 5,
      showAxes: true,
    });

    const vehicleLayer = new VehicleLayer();
    vehicleLayerRef.current = vehicleLayer;

    const pathLayer = new PathLayer();

    // Add layers to renderer
    renderer.addLayer(gridLayer);
    renderer.addLayer(pathLayer);
    renderer.addLayer(vehicleLayer);

    // Toggle layer visibility based on props
    gridLayer.visible = showGrid;
    pathLayer.visible = showPaths;

    // Setup interactions
    const interactionHandler = new CanvasInteractionHandler(renderer, {
      onVehicleClick: (vehicleId) => {
        setSelectedVehicleId(vehicleId);
        vehicleLayer.setSelectedVehicle(vehicleId);
        onVehicleSelect?.(vehicleId);
      },
      onCanvasClick: () => {
        setSelectedVehicleId(null);
        vehicleLayer.setSelectedVehicle(null);
        onVehicleSelect?.(null);
      },
    });

    interactionRef.current = interactionHandler;

    // Set cursor
    canvas.style.cursor = 'grab';

    // Start rendering
    renderer.start();

    setIsInitialized(true);

    // Cleanup
    return () => {
      renderer.stop();
      renderer.destroy();
      interactionHandler.destroy();
    };
  }, [isInitialized, showGrid, showPaths, onVehicleSelect, setSelectedVehicleId]);

  // Update vehicles on canvas when store changes
  useEffect(() => {
    if (!vehicleLayerRef.current || !isInitialized) return;

    const vehicleArray = Array.from(vehicles.values());
    const vehicleData = vehicleArray.map((vehicle) => ({
      vehicle,
      position: positions.get(vehicle.id),
      isSelected: vehicle.id === selectedVehicleId,
    }));

    vehicleLayerRef.current.setVehicles(vehicleData);
  }, [vehicles, positions, selectedVehicleId, isInitialized]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !rendererRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      rendererRef.current.resize(rect.width, rect.height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Zoom controls
  const handleZoomIn = () => {
    rendererRef.current?.zoom(0.2);
  };

  const handleZoomOut = () => {
    rendererRef.current?.zoom(-0.2);
  };

  const handleResetView = () => {
    rendererRef.current?.resetViewport();
  };

  return (
    <div style={{ position: 'relative', width, height }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          backgroundColor: '#FAFAFA',
        }}
      />

      {/* Zoom Controls */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}
      >
        <button
          onClick={handleZoomIn}
          style={{
            padding: '8px 12px',
            backgroundColor: '#FFF',
            border: '1px solid #CCC',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            padding: '8px 12px',
            backgroundColor: '#FFF',
            border: '1px solid #CCC',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={handleResetView}
          style={{
            padding: '8px 12px',
            backgroundColor: '#FFF',
            border: '1px solid #CCC',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
          title="Reset View"
        >
          ⟲
        </button>
      </div>

      {/* Info Panel */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
        }}
      >
        <div>Vehicles: {vehicles.size}</div>
        <div>Active: {Array.from(vehicles.values()).filter((v) => v.isEnabled).length}</div>
        <div style={{ marginTop: '5px', fontSize: '10px', color: '#666' }}>
          Scroll: Zoom | Drag: Pan | Click: Select
        </div>
      </div>
    </div>
  );
};

export default MapCanvas;
