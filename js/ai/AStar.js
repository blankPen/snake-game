/**
 * A* 寻路算法
 * 用于 AI 蛇寻找食物路径
 */

export class AStar {
  constructor(gridWidth, gridHeight) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
  }

  /**
   * 查找从起点到终点的路径
   * @param {Object} start - 起点 {x, y}
   * @param {Object} end - 终点 {x, y}
   * @param {Array} obstacles - 障碍物数组 [{x, y}, ...]
   * @returns {Array|null} 路径数组或 null
   */
  findPath(start, end, obstacles = []) {
    // 创建障碍物 Set 以便快速查找
    const obstacleSet = new Set(obstacles.map(o => `${o.x},${o.y}`));
    
    // 优先队列 (使用简单数组实现)
    const openSet = [this._createNode(start, null, 0, this._heuristic(start, end))];
    const closedSet = new Set();
    
    while (openSet.length > 0) {
      // 按 f 值排序，取出最小
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift();
      
      // 检查是否到达终点
      if (current.x === end.x && current.y === end.y) {
        return this._reconstructPath(current);
      }
      
      const currentKey = `${current.x},${current.y}`;
      if (closedSet.has(currentKey)) continue;
      closedSet.add(currentKey);
      
      // 遍历相邻格子
      const neighbors = this._getNeighbors(current);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        
        if (closedSet.has(neighborKey)) continue;
        if (obstacleSet.has(neighborKey)) continue;
        
        const g = current.g + 1;
        const h = this._heuristic(neighbor, end);
        const f = g + h;
        
        // 检查是否已在 openSet 中
        const existing = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
        if (existing) {
          if (g < existing.g) {
            existing.g = g;
            existing.f = f;
            existing.parent = current;
          }
        } else {
          openSet.push(this._createNode(neighbor, current, g, h));
        }
      }
    }
    
    // 未找到路径
    return null;
  }

  /**
   * 创建节点
   */
  _createNode(position, parent, g, h) {
    return {
      x: position.x,
      y: position.y,
      parent,
      g,
      h,
      f: g + h
    };
  }

  /**
   * 曼哈顿启发式函数
   */
  _heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  /**
   * 获取相邻格子
   */
  _getNeighbors(node) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -1 }, // 上
      { x: 0, y: 1 },  // 下
      { x: -1, y: 0 }, // 左
      { x: 1, y: 0 }   // 右
    ];
    
    for (const dir of directions) {
      const x = node.x + dir.x;
      const y = node.y + dir.y;
      
      // 检查边界
      if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
        neighbors.push({ x, y });
      }
    }
    
    return neighbors;
  }

  /**
   * 重建路径
   */
  _reconstructPath(node) {
    const path = [];
    let current = node;
    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }
    return path;
  }
}
