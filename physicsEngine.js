export class PhysicsEngine {
  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 10;
    
    this.bodies = [];
    this.constraints = [];
    
    // Ground plane
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    this.world.addBody(groundBody);
  }

  createBody(options) {
    const { shape, mass, position, material } = options;
    const body = new CANNON.Body({
      mass: mass,
      position: new CANNON.Vec3(...position),
      material: material
    });
    
    body.addShape(shape);
    this.world.addBody(body);
    this.bodies.push(body);
    return body;
  }

  update(deltaTime) {
    this.world.step(deltaTime);
  }

  applyForce(body, force, worldPoint) {
    body.applyForce(new CANNON.Vec3(...force), new CANNON.Vec3(...worldPoint));
  }

  applyImpulse(body, impulse, worldPoint) {
    body.applyImpulse(new CANNON.Vec3(...impulse), new CANNON.Vec3(...worldPoint));
  }

  createConstraint(bodyA, bodyB, options) {
    const constraint = new CANNON.PointToPointConstraint(
      bodyA,
      new CANNON.Vec3(...options.pivotA),
      bodyB,
      new CANNON.Vec3(...options.pivotB)
    );
    this.world.addConstraint(constraint);
    this.constraints.push(constraint);
    return constraint;
  }
}