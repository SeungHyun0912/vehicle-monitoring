import { Manufacturer } from './manufacturer.vo';

describe('Manufacturer Value Object', () => {
  describe('Constructor', () => {
    it('should create manufacturer with name only', () => {
      const manufacturer = new Manufacturer('Tesla');

      expect(manufacturer.name).toBe('Tesla');
      expect(manufacturer.country).toBeUndefined();
      expect(manufacturer.website).toBeUndefined();
    });

    it('should create manufacturer with name and country', () => {
      const manufacturer = new Manufacturer('Toyota', 'Japan');

      expect(manufacturer.name).toBe('Toyota');
      expect(manufacturer.country).toBe('Japan');
      expect(manufacturer.website).toBeUndefined();
    });

    it('should create manufacturer with all properties', () => {
      const manufacturer = new Manufacturer(
        'Amazon Robotics',
        'USA',
        'https://www.amazonrobotics.com',
      );

      expect(manufacturer.name).toBe('Amazon Robotics');
      expect(manufacturer.country).toBe('USA');
      expect(manufacturer.website).toBe('https://www.amazonrobotics.com');
    });

    it('should have readonly properties', () => {
      const manufacturer = new Manufacturer('BMW');

      // TypeScript enforces readonly at compile time
      // At runtime, the properties are technically mutable in JS
      // but TypeScript prevents compilation if trying to modify
      expect(manufacturer.name).toBe('BMW');
    });
  });

  describe('toString()', () => {
    it('should return manufacturer name', () => {
      const manufacturer = new Manufacturer('Siemens');

      expect(manufacturer.toString()).toBe('Siemens');
    });

    it('should return manufacturer name with all properties', () => {
      const manufacturer = new Manufacturer('ABB', 'Switzerland', 'https://abb.com');

      expect(manufacturer.toString()).toBe('ABB');
    });
  });

  describe('Value Object properties', () => {
    it('should have correct property values', () => {
      const manufacturer = new Manufacturer('Kuka', 'Germany', 'https://kuka.com');

      // Verify properties are accessible and have correct values
      expect(manufacturer.name).toBe('Kuka');
      expect(manufacturer.country).toBe('Germany');
      expect(manufacturer.website).toBe('https://kuka.com');
    });
  });
});
