// Glow Gradient Viewer - simplified for tomashalling.se
(function() {
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255] : [1, 1, 1];
  }

  function createShader(glctx, type, source) {
    const shader = glctx.createShader(type);
    glctx.shaderSource(shader, source);
    glctx.compileShader(shader);
    if (!glctx.getShaderParameter(shader, glctx.COMPILE_STATUS)) {
      console.error("Shader compilation error:", glctx.getShaderInfoLog(shader));
      glctx.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createProgram(glctx, vertexShader, fragmentShader) {
    const program = glctx.createProgram();
    glctx.attachShader(program, vertexShader);
    glctx.attachShader(program, fragmentShader);
    glctx.linkProgram(program);
    if (!glctx.getProgramParameter(program, glctx.LINK_STATUS)) {
      console.error("Program linking error:", glctx.getProgramInfoLog(program));
      glctx.deleteProgram(program);
      return null;
    }
    return program;
  }

  const simplexNoiseSource = `
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v){ 
      const vec2  C = vec2(1.0/6.0, 1.0/3.0);
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }
    float snoise2D(vec2 v) { return snoise(vec3(v, 0.0)); }
  `;

  const fragmentCommon = `
    precision highp float;
    out vec4 outColor;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_center;
    uniform float u_scale;
    uniform float u_scaleX;
    uniform float u_scaleY;
    uniform float u_blur;
    uniform float u_feather;
    uniform float u_flowSpeed;
    uniform float u_flowAmount;
    uniform vec2 u_flowDir;
    uniform float u_edgeInner;
    uniform float u_edgeOuter;
    uniform float u_tangentFlow;
    uniform float u_noiseScale;
    uniform float u_waveHeight;
    uniform float u_waveSpeed;
    uniform vec2 u_position;
    uniform float u_patternScale;
    uniform float u_patternSpeed;
    uniform float u_patternRotation;
    uniform vec2 u_patternOffset;
    uniform float u_patternIntensity;
    uniform float u_patternContrast;
    uniform float u_patternTurbulence;
    uniform vec3 u_colorStop1;
    uniform vec3 u_colorStop2;
    uniform vec3 u_colorStop3;
    uniform vec3 u_colorStop4;
    uniform vec3 u_colorStop5;
    uniform float u_stopPos1;
    uniform float u_stopPos2;
    uniform float u_stopPos3;
    uniform float u_stopPos4;
    uniform float u_stopPos5;
    uniform float u_controlPoint0;
    uniform float u_controlPoint1;
    uniform float u_controlPoint2;
    uniform float u_controlPoint3;
    uniform float u_controlPoint4;
    uniform float u_controlPoint5;
    uniform float u_controlPoint6;
    uniform float u_controlPoint7;
    uniform float u_controlPoint8;
    uniform float u_controlPoint9;
    ${simplexNoiseSource}
    float cubicBezier(float t, float p0, float p1, float p2, float p3) {
      float oneMinusT = 1.0 - t;
      float omt2 = oneMinusT * oneMinusT;
      float omt3 = omt2 * oneMinusT;
      float t2 = t * t;
      float t3 = t2 * t;
      return omt3 * p0 + 3.0 * omt2 * t * p1 + 3.0 * oneMinusT * t2 * p2 + t3 * p3;
    }
    float getBlobRadius(float angle) {
      angle = angle - floor(angle * 0.159155) * 6.28318;
      if (angle < 0.0) angle += 6.28318;
      const float pointSpacing = 0.628318;
      const float invSpacing = 1.59155;
      int pointIndex = int(angle * invSpacing);
      float localT = (angle - float(pointIndex) * pointSpacing) * invSpacing;
      float p0, p1, p2, p3, prevP;
      if (pointIndex == 0) { p0 = u_controlPoint0; p1 = u_controlPoint1; p2 = u_controlPoint2; p3 = u_controlPoint3; prevP = u_controlPoint9; }
      else if (pointIndex == 1) { p0 = u_controlPoint1; p1 = u_controlPoint2; p2 = u_controlPoint3; p3 = u_controlPoint4; prevP = u_controlPoint0; }
      else if (pointIndex == 2) { p0 = u_controlPoint2; p1 = u_controlPoint3; p2 = u_controlPoint4; p3 = u_controlPoint5; prevP = u_controlPoint1; }
      else if (pointIndex == 3) { p0 = u_controlPoint3; p1 = u_controlPoint4; p2 = u_controlPoint5; p3 = u_controlPoint6; prevP = u_controlPoint2; }
      else if (pointIndex == 4) { p0 = u_controlPoint4; p1 = u_controlPoint5; p2 = u_controlPoint6; p3 = u_controlPoint7; prevP = u_controlPoint3; }
      else if (pointIndex == 5) { p0 = u_controlPoint5; p1 = u_controlPoint6; p2 = u_controlPoint7; p3 = u_controlPoint8; prevP = u_controlPoint4; }
      else if (pointIndex == 6) { p0 = u_controlPoint6; p1 = u_controlPoint7; p2 = u_controlPoint8; p3 = u_controlPoint9; prevP = u_controlPoint5; }
      else if (pointIndex == 7) { p0 = u_controlPoint7; p1 = u_controlPoint8; p2 = u_controlPoint9; p3 = u_controlPoint0; prevP = u_controlPoint6; }
      else if (pointIndex == 8) { p0 = u_controlPoint8; p1 = u_controlPoint9; p2 = u_controlPoint0; p3 = u_controlPoint1; prevP = u_controlPoint7; }
      else { p0 = u_controlPoint9; p1 = u_controlPoint0; p2 = u_controlPoint1; p3 = u_controlPoint2; prevP = u_controlPoint8; }
      float cp1 = p0 + (p1 - prevP) * 0.3;
      float cp2 = p1 - (p2 - p0) * 0.3;
      return cubicBezier(localT, p0, cp1, cp2, p1);
    }
    float blobNoise(vec2 p, float time) {
      const float L = 0.0018; const float S = 0.04; const float F = 0.043;
      float t1 = F * time; float t2 = time * S * 1.26; float t3 = time * S * 1.09; float t4 = time * S * 0.89;
      float ft126 = t1 * 1.26; float ft109 = t1 * 1.09; float ft089 = t1 * 0.89;
      float noise = 0.0;
      noise += snoise2D(p * 0.0018 + vec2(t1, 0.0)) * 0.85;
      noise += snoise2D(p * 0.0013846 + vec2(ft126, t2)) * 1.15;
      noise += snoise2D(p * 0.0009677 + vec2(ft109, t3)) * 0.60;
      noise += snoise2D(p * 0.0005538 + vec2(ft089, t4)) * 0.40;
      return noise;
    }
    float blobNoise2(vec2 p, float time) {
      const float L = 0.0022; const float S = 0.05; const float F = 0.038;
      float noise = 0.0;
      noise += snoise2D(p * (L / 1.15) + vec2(-F * time * 0.8, time * S * 0.9)) * 1.0;
      noise += snoise2D(p * (L / 1.50) + vec2(F * time * 1.4, -time * S * 1.1)) * 0.90;
      noise += snoise2D(p * (L / 2.10) + vec2(F * time * 0.7, time * S * 1.3)) * 0.70;
      noise += snoise2D(p * (L / 3.80) + vec2(-F * time * 1.2, time * S * 0.8)) * 0.50;
      noise += snoise2D(p * (L / 5.50) + vec2(F * time * 0.6, -time * S * 1.5)) * 0.35;
      return noise;
    }
    float backgroundNoise(vec2 p, float time, float offset) {
      const float L = 0.0015; const float S = 0.13; const float Y_SCALE = 3.0; const float F = 0.11;
      float t = time + offset; float tS = t * S; float x = p.x * L; float y = p.y * L * Y_SCALE;
      float noise = 0.5;
      noise += snoise(vec3(x + F * t, y, tS)) * 0.30;
      noise += snoise(vec3(x * 0.6 + F * t * 0.6, y * 0.85, tS)) * 0.26;
      noise += snoise(vec3(x * 0.4 + F * t * 0.8, y * 0.70, tS)) * 0.22;
      float turbulence = u_patternTurbulence;
      if (turbulence > 0.0) {
        vec2 turbCoord = p * 0.003 + vec2(time * 0.05, time * 0.07);
        vec2 turb = vec2(snoise2D(turbCoord), snoise2D(turbCoord + vec2(100.0, 0.0))) * turbulence * 50.0;
        noise += snoise(vec3((x + turb.x) * 0.8 + F * t * 0.9, (y + turb.y) * 0.75, tS * 0.85)) * 0.15 * turbulence;
      }
      noise = clamp(noise, 0.0, 1.0);
      float contrast = u_patternContrast;
      noise = (noise - 0.5) * contrast + 0.5;
      return clamp(noise, 0.0, 1.0);
    }
    vec2 rotate2D(vec2 v, float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
    }
    float smoothstep5(float t) { float t2 = t * t; float t3 = t2 * t; return t3 * (t * (6.0 * t - 15.0) + 10.0); }
    vec3 gradientColor(float t) {
      if (t <= u_stopPos1) return u_colorStop1; if (t >= u_stopPos5) return u_colorStop5;
      if (t <= u_stopPos2) { float range = u_stopPos2 - u_stopPos1; float localT = max(0.0, (t - u_stopPos1)) / max(0.0001, range); return mix(u_colorStop1, u_colorStop2, localT); }
      else if (t <= u_stopPos3) { float range = u_stopPos3 - u_stopPos2; float localT = max(0.0, (t - u_stopPos2)) / max(0.0001, range); return mix(u_colorStop2, u_colorStop3, localT); }
      else if (t <= u_stopPos4) { float range = u_stopPos4 - u_stopPos3; float localT = max(0.0, (t - u_stopPos3)) / max(0.0001, range); return mix(u_colorStop3, u_colorStop4, localT); }
      else { float range = u_stopPos5 - u_stopPos4; float localT = max(0.0, (t - u_stopPos4)) / max(0.0001, range); return mix(u_colorStop4, u_colorStop5, localT); }
    }
  `;

  const vertexShaderSource = `#version 300 es\n  in vec2 a_position;\n  void main(){ gl_Position = vec4(a_position, 0, 1); }`;
  const fragmentShaderSource = `#version 300 es\n${fragmentCommon}\n  void main(){ vec2 uv = gl_FragCoord.xy; vec2 p = (uv - u_center - u_position) / vec2(u_scaleX, u_scaleY); float dist = length(p); float angle = atan(p.y, p.x); float baseRadius = 300.0; float radiusOffset = getBlobRadius(angle); float noise = blobNoise(p * u_noiseScale, u_time * u_waveSpeed); float waveDisplacement = noise * u_waveHeight * 0.3; float blobRadius = baseRadius + radiusOffset + waveDisplacement; float blobDist = dist - blobRadius; float alpha = smoothstep(u_blur, -u_blur, blobDist); float featherAlpha = smoothstep(u_feather, -u_feather, blobDist); alpha = mix(alpha, min(alpha, featherAlpha), step(0.001, u_feather)); alpha = smoothstep5(clamp(alpha, 0.0, 1.0)); float edgeFactor = smoothstep(u_edgeOuter, u_edgeInner, abs(blobDist)); vec2 tangent = normalize(vec2(-p.y, p.x)); vec2 flowOffset = u_flowDir * (u_time * u_flowAmount * u_flowSpeed * 10.0) + tangent * (u_tangentFlow * u_time * u_flowAmount * u_flowSpeed * 10.0 * edgeFactor); vec2 patternP = rotate2D((p + u_patternOffset) * u_patternScale, u_patternRotation); float noiseValue = backgroundNoise(patternP + flowOffset, u_time * u_patternSpeed, 0.0); noiseValue = mix(0.5, noiseValue, u_patternIntensity); vec3 color = gradientColor(noiseValue); outColor = vec4(color, alpha); }`;
  const fragmentShaderSource2 = `#version 300 es\n${fragmentCommon}\n  void main(){ vec2 uv = gl_FragCoord.xy; vec2 centeredP = uv - u_center - u_position; vec2 p = centeredP / vec2(u_scaleX, u_scaleY); float angle = atan(p.y, p.x); float dist = length(p); float baseRadius = 300.0; float radiusOffset = getBlobRadius(angle); float noise = blobNoise2(p * u_noiseScale, u_time * u_waveSpeed); float waveDisplacement = noise * u_waveHeight * 0.3; float blobRadius = baseRadius + radiusOffset + waveDisplacement; float blobDist = dist - blobRadius; float alpha = smoothstep(u_blur, -u_blur, blobDist); if (u_feather > 0.0) { float featherAlpha = smoothstep(u_feather, -u_feather, blobDist); alpha = min(alpha, featherAlpha); } alpha = smoothstep5(clamp(alpha, 0.0, 1.0)); float edgeFactor = smoothstep(u_edgeOuter, u_edgeInner, abs(blobDist)); vec2 tangent = normalize(vec2(-p.y, p.x)); vec2 flowOffset = u_flowDir * (u_time * u_flowAmount * u_flowSpeed * 10.0) + tangent * (u_tangentFlow * u_time * u_flowAmount * u_flowSpeed * 10.0 * edgeFactor); vec2 patternP = rotate2D((p + u_patternOffset) * u_patternScale, u_patternRotation); float noiseValue = backgroundNoise(patternP + flowOffset, u_time * u_patternSpeed, 0.0); noiseValue = mix(0.5, noiseValue, u_patternIntensity); vec3 color = gradientColor(noiseValue); outColor = vec4(color, alpha); }`;

  // Default parameters
  const params = {
    colorStop1: "#FFF8A0",
    colorStop2: "#87CEEB",
    colorStop3: "#FF8C42",
    colorStop4: "#FF6B35",
    colorStop5: "#D44226",
    stopPos1: 0.0,
    stopPos2: 0.3,
    stopPos3: 0.6,
    stopPos4: 0.85,
    stopPos5: 1.0,
    positionX: 400,
    positionY: 400,
    positionMode: "relative",
    positionPercentX: 50.0,
    positionPercentY: 50.0,
    controlPoint0: 0.0,
    controlPoint1: 20.0,
    controlPoint2: 15.0,
    controlPoint3: 0.0,
    controlPoint4: -10.0,
    controlPoint5: -15.0,
    controlPoint6: -10.0,
    controlPoint7: 0.0,
    controlPoint8: 15.0,
    controlPoint9: 20.0,
    blur: 80.0,
    feather: 40.0,
    flowSpeed: 0.1,
    flowAmount: 0.5,
    noiseScale: 1.0,
    waveHeight: 50.0,
    waveSpeed: 0.1,
    patternScale: 0.5,
    patternSpeed: 1.0,
    patternRotation: 0.0,
    patternOffsetX: 0.0,
    patternOffsetY: 0.0,
    patternIntensity: 1.0,
    patternContrast: 1.0,
    patternTurbulence: 0.0,
    scaleX: 2.6,
    scaleY: 2.0,
    edgeInner: 30.0,
    edgeOuter: 150.0,
    tangentFlow: 0.5,
  };

  const params2 = {
    colorStop1: "#FFE066",
    colorStop2: "#70B8D8",
    colorStop3: "#FFA366",
    colorStop4: "#FF7F4D",
    colorStop5: "#E05A3A",
    stopPos1: 0.0,
    stopPos2: 0.25,
    stopPos3: 0.55,
    stopPos4: 0.8,
    stopPos5: 1.0,
    positionX: 450,
    positionY: 450,
    positionMode: "relative",
    positionPercentX: 50.0,
    positionPercentY: 50.0,
    controlPoint0: 15.0,
    controlPoint1: 10.0,
    controlPoint2: 0.0,
    controlPoint3: -15.0,
    controlPoint4: -20.0,
    controlPoint5: -15.0,
    controlPoint6: -5.0,
    controlPoint7: 10.0,
    controlPoint8: 20.0,
    controlPoint9: 15.0,
    blur: 80.0,
    feather: 40.0,
    flowSpeed: 0.1,
    flowAmount: 0.5,
    noiseScale: 1.0,
    waveHeight: 50.0,
    waveSpeed: 0.1,
    patternScale: 0.5,
    patternSpeed: 1.0,
    patternRotation: 0.0,
    patternOffsetX: 0.0,
    patternOffsetY: 0.0,
    patternIntensity: 1.0,
    patternContrast: 1.0,
    patternTurbulence: 0.0,
    scaleX: 2.6,
    scaleY: 2.0,
  };

  let blendMode = "screen";
  let globalBlur = 100.0;

  const canvas = document.getElementById("_gg_canvas1");
  const canvas2 = document.getElementById("_gg_canvas2");
  const grainOverlay = document.getElementById("_gg_grain");

  if (!canvas || !canvas2) {
    console.warn("Gradient canvases not found");
    return;
  }

  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
  if (!gl) {
    console.warn("WebGL not supported");
    return;
  }

  const gl2 = canvas2.getContext("webgl2") || canvas2.getContext("webgl");
  if (!gl2) {
    console.warn("WebGL not supported");
    return;
  }

  const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = createProgram(gl, vs, fs);
  const vs2 = createShader(gl2, gl2.VERTEX_SHADER, vertexShaderSource);
  const fs2 = createShader(gl2, gl2.FRAGMENT_SHADER, fragmentShaderSource2);
  const program2 = createProgram(gl2, vs2, fs2);

  if (!program || !program2) {
    console.warn("Failed to create shader programs");
    return;
  }

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const positionBuffer2 = gl2.createBuffer();
  gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBuffer2);
  gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl2.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  const timeLocation = gl.getUniformLocation(program, "u_time");
  const centerLocation = gl.getUniformLocation(program, "u_center");
  const scaleXLocation = gl.getUniformLocation(program, "u_scaleX");
  const scaleYLocation = gl.getUniformLocation(program, "u_scaleY");
  const blurLocation = gl.getUniformLocation(program, "u_blur");
  const featherLocation = gl.getUniformLocation(program, "u_feather");
  const flowSpeedLocation = gl.getUniformLocation(program, "u_flowSpeed");
  const flowAmountLocation = gl.getUniformLocation(program, "u_flowAmount");
  const flowDirLocation = gl.getUniformLocation(program, "u_flowDir");
  const edgeInnerLocation = gl.getUniformLocation(program, "u_edgeInner");
  const edgeOuterLocation = gl.getUniformLocation(program, "u_edgeOuter");
  const tangentFlowLocation = gl.getUniformLocation(program, "u_tangentFlow");
  const noiseScaleLocation = gl.getUniformLocation(program, "u_noiseScale");
  const waveHeightLocation = gl.getUniformLocation(program, "u_waveHeight");
  const waveSpeedLocation = gl.getUniformLocation(program, "u_waveSpeed");
  const positionLocation_uniform = gl.getUniformLocation(program, "u_position");
  const patternScaleLocation = gl.getUniformLocation(program, "u_patternScale");
  const patternSpeedLocation = gl.getUniformLocation(program, "u_patternSpeed");
  const patternRotationLocation = gl.getUniformLocation(program, "u_patternRotation");
  const patternOffsetLocation = gl.getUniformLocation(program, "u_patternOffset");
  const patternIntensityLocation = gl.getUniformLocation(program, "u_patternIntensity");
  const patternContrastLocation = gl.getUniformLocation(program, "u_patternContrast");
  const patternTurbulenceLocation = gl.getUniformLocation(program, "u_patternTurbulence");
  const colorStop1Location = gl.getUniformLocation(program, "u_colorStop1");
  const colorStop2Location = gl.getUniformLocation(program, "u_colorStop2");
  const colorStop3Location = gl.getUniformLocation(program, "u_colorStop3");
  const colorStop4Location = gl.getUniformLocation(program, "u_colorStop4");
  const colorStop5Location = gl.getUniformLocation(program, "u_colorStop5");
  const stopPos1Location = gl.getUniformLocation(program, "u_stopPos1");
  const stopPos2Location = gl.getUniformLocation(program, "u_stopPos2");
  const stopPos3Location = gl.getUniformLocation(program, "u_stopPos3");
  const stopPos4Location = gl.getUniformLocation(program, "u_stopPos4");
  const stopPos5Location = gl.getUniformLocation(program, "u_stopPos5");
  const controlPointLocations = Array.from({ length: 10 }, (_, i) => gl.getUniformLocation(program, `u_controlPoint${i}`));

  const positionLocation2 = gl2.getAttribLocation(program2, "a_position");
  const resolutionLocation2 = gl2.getUniformLocation(program2, "u_resolution");
  const timeLocation2 = gl2.getUniformLocation(program2, "u_time");
  const centerLocation2 = gl2.getUniformLocation(program2, "u_center");
  const scaleXLocation2 = gl2.getUniformLocation(program2, "u_scaleX");
  const scaleYLocation2 = gl2.getUniformLocation(program2, "u_scaleY");
  const blurLocation2 = gl2.getUniformLocation(program2, "u_blur");
  const featherLocation2 = gl2.getUniformLocation(program2, "u_feather");
  const flowSpeedLocation2 = gl2.getUniformLocation(program2, "u_flowSpeed");
  const flowAmountLocation2 = gl2.getUniformLocation(program2, "u_flowAmount");
  const flowDirLocation2 = gl2.getUniformLocation(program2, "u_flowDir");
  const edgeInnerLocation2 = gl2.getUniformLocation(program2, "u_edgeInner");
  const edgeOuterLocation2 = gl2.getUniformLocation(program2, "u_edgeOuter");
  const tangentFlowLocation2 = gl2.getUniformLocation(program2, "u_tangentFlow");
  const noiseScaleLocation2 = gl2.getUniformLocation(program2, "u_noiseScale");
  const waveHeightLocation2 = gl2.getUniformLocation(program2, "u_waveHeight");
  const waveSpeedLocation2 = gl2.getUniformLocation(program2, "u_waveSpeed");
  const positionLocation_uniform2 = gl2.getUniformLocation(program2, "u_position");
  const patternScaleLocation2 = gl2.getUniformLocation(program2, "u_patternScale");
  const patternSpeedLocation2 = gl2.getUniformLocation(program2, "u_patternSpeed");
  const patternRotationLocation2 = gl2.getUniformLocation(program2, "u_patternRotation");
  const patternOffsetLocation2 = gl2.getUniformLocation(program2, "u_patternOffset");
  const patternIntensityLocation2 = gl2.getUniformLocation(program2, "u_patternIntensity");
  const patternContrastLocation2 = gl2.getUniformLocation(program2, "u_patternContrast");
  const patternTurbulenceLocation2 = gl2.getUniformLocation(program2, "u_patternTurbulence");
  const colorStop1Location2 = gl2.getUniformLocation(program2, "u_colorStop1");
  const colorStop2Location2 = gl2.getUniformLocation(program2, "u_colorStop2");
  const colorStop3Location2 = gl2.getUniformLocation(program2, "u_colorStop3");
  const colorStop4Location2 = gl2.getUniformLocation(program2, "u_colorStop4");
  const colorStop5Location2 = gl2.getUniformLocation(program2, "u_colorStop5");
  const stopPos1Location2 = gl2.getUniformLocation(program2, "u_stopPos1");
  const stopPos2Location2 = gl2.getUniformLocation(program2, "u_stopPos2");
  const stopPos3Location2 = gl2.getUniformLocation(program2, "u_stopPos3");
  const stopPos4Location2 = gl2.getUniformLocation(program2, "u_stopPos4");
  const stopPos5Location2 = gl2.getUniformLocation(program2, "u_stopPos5");
  const controlPointLocations2 = Array.from({ length: 10 }, (_, i) => gl2.getUniformLocation(program2, `u_controlPoint${i}`));

  function updateGlobalBlur() {
    const blurValue = (params.globalBlur || globalBlur) > 0 ? `${params.globalBlur || globalBlur}px` : "none";
    canvas.style.filter = `blur(${blurValue})`;
    canvas2.style.filter = `blur(${blurValue})`;
  }

  // Add grain params to params object
  params.grainOpacity = 0.05;
  params.grainScale = 1.0;
  params.grainBlend = "overlay";
  params.globalBlur = 100.0;
  params.blendMode = blendMode;

  function updateGrain() {
    if (!grainOverlay) return;
    const grainOverlay2 = document.getElementById("_gg_grain_overlay");
    grainOverlay.style.opacity = params.grainOpacity || 0.05;
    if (grainOverlay2) {
      grainOverlay2.style.opacity = params.grainOpacity || 0.05;
      const baseSize = 200;
      const scaledSize = baseSize / (params.grainScale || 1.0);
      grainOverlay2.style.backgroundSize = `${scaledSize}px ${scaledSize}px`;
      grainOverlay2.style.mixBlendMode = params.grainBlend || "overlay";
    }
    const baseSize = 200;
    const scaledSize = baseSize / (params.grainScale || 1.0);
    grainOverlay.style.backgroundSize = `${scaledSize}px ${scaledSize}px`;
    grainOverlay.style.mixBlendMode = params.grainBlend || "overlay";
  }

  function resizeCanvas() {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
    if (canvas2.width !== displayWidth || canvas2.height !== displayHeight) {
      canvas2.width = displayWidth;
      canvas2.height = displayHeight;
      gl2.viewport(0, 0, gl2.canvas.width, gl2.canvas.height);
    }
  }

  let startTime = performance.now() / 1000.0;
  function render() {
    resizeCanvas();
    const currentTime = performance.now() / 1000.0 - startTime;
    
    // Layer 1
    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(timeLocation, currentTime);
    gl.uniform2f(centerLocation, gl.canvas.width / 2, gl.canvas.height / 2);
    gl.uniform1f(scaleXLocation, params.scaleX || 1.0);
    gl.uniform1f(scaleYLocation, params.scaleY || 1.0);
    gl.uniform1f(blurLocation, params.blur);
    gl.uniform1f(featherLocation, params.feather);
    gl.uniform1f(flowSpeedLocation, params.flowSpeed);
    gl.uniform1f(flowAmountLocation, params.flowAmount);
    const angleRad = ((params.flowAngle || 0) * Math.PI) / 180;
    gl.uniform2f(flowDirLocation, Math.cos(angleRad), Math.sin(angleRad));
    gl.uniform1f(edgeInnerLocation, params.edgeInner || 30.0);
    gl.uniform1f(edgeOuterLocation, params.edgeOuter || 150.0);
    gl.uniform1f(tangentFlowLocation, params.tangentFlow || 0.5);
    gl.uniform1f(noiseScaleLocation, params.noiseScale);
    gl.uniform1f(waveHeightLocation, params.waveHeight);
    gl.uniform1f(waveSpeedLocation, params.waveSpeed || 0.1);
    gl.uniform1f(patternScaleLocation, params.patternScale || 0.5);
    gl.uniform1f(patternSpeedLocation, params.patternSpeed || 1.0);
    gl.uniform1f(patternRotationLocation, (params.patternRotation || 0.0) * Math.PI / 180);
    gl.uniform2f(patternOffsetLocation, params.patternOffsetX || 0.0, params.patternOffsetY || 0.0);
    gl.uniform1f(patternIntensityLocation, params.patternIntensity || 1.0);
    gl.uniform1f(patternContrastLocation, params.patternContrast || 1.0);
    gl.uniform1f(patternTurbulenceLocation, params.patternTurbulence || 0.0);
    let posX = params.positionX || 400;
    let posY = params.positionY || 400;
    if (params.positionMode === "relative") {
      posX = (params.positionPercentX || 0) * gl.canvas.width / 200.0;
      posY = (params.positionPercentY || 0) * gl.canvas.height / 200.0;
    }
    gl.uniform2f(positionLocation_uniform, posX, posY);
    const rgb1 = hexToRgb(params.colorStop1);
    const rgb2 = hexToRgb(params.colorStop2);
    const rgb3 = hexToRgb(params.colorStop3);
    const rgb4 = hexToRgb(params.colorStop4);
    const rgb5 = hexToRgb(params.colorStop5);
    gl.uniform3f(colorStop1Location, rgb1[0], rgb1[1], rgb1[2]);
    gl.uniform3f(colorStop2Location, rgb2[0], rgb2[1], rgb2[2]);
    gl.uniform3f(colorStop3Location, rgb3[0], rgb3[1], rgb3[2]);
    gl.uniform3f(colorStop4Location, rgb4[0], rgb4[1], rgb4[2]);
    gl.uniform3f(colorStop5Location, rgb5[0], rgb5[1], rgb5[2]);
    gl.uniform1f(stopPos1Location, params.stopPos1);
    gl.uniform1f(stopPos2Location, params.stopPos2);
    gl.uniform1f(stopPos3Location, params.stopPos3);
    gl.uniform1f(stopPos4Location, params.stopPos4);
    gl.uniform1f(stopPos5Location, params.stopPos5);
    for (let i = 0; i < 10; i++) gl.uniform1f(controlPointLocations[i], params[`controlPoint${i}`]);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Layer 2
    gl2.useProgram(program2);
    gl2.enable(gl2.BLEND);
    gl2.blendFunc(gl2.SRC_ALPHA, gl2.ONE_MINUS_SRC_ALPHA);
    gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBuffer2);
    gl2.enableVertexAttribArray(positionLocation2);
    gl2.vertexAttribPointer(positionLocation2, 2, gl2.FLOAT, false, 0, 0);
    gl2.uniform2f(resolutionLocation2, gl2.canvas.width, gl2.canvas.height);
    gl2.uniform1f(timeLocation2, currentTime);
    gl2.uniform2f(centerLocation2, gl2.canvas.width / 2, gl2.canvas.height / 2);
    gl2.uniform1f(scaleXLocation2, params2.scaleX || 1.0);
    gl2.uniform1f(scaleYLocation2, params2.scaleY || 1.0);
    gl2.uniform1f(blurLocation2, params2.blur);
    gl2.uniform1f(featherLocation2, params2.feather);
    gl2.uniform1f(flowSpeedLocation2, params2.flowSpeed);
    gl2.uniform1f(flowAmountLocation2, params2.flowAmount);
    const angleRad2 = ((params2.flowAngle || 0) * Math.PI) / 180;
    gl2.uniform2f(flowDirLocation2, Math.cos(angleRad2), Math.sin(angleRad2));
    gl2.uniform1f(edgeInnerLocation2, params.edgeInner || 30.0);
    gl2.uniform1f(edgeOuterLocation2, params.edgeOuter || 150.0);
    gl2.uniform1f(tangentFlowLocation2, params.tangentFlow || 0.5);
    gl2.uniform1f(noiseScaleLocation2, params2.noiseScale);
    gl2.uniform1f(waveHeightLocation2, params2.waveHeight);
    gl2.uniform1f(waveSpeedLocation2, params2.waveSpeed || 0.1);
    gl2.uniform1f(patternScaleLocation2, params2.patternScale || 0.5);
    gl2.uniform1f(patternSpeedLocation2, params2.patternSpeed || 1.0);
    gl2.uniform1f(patternRotationLocation2, (params2.patternRotation || 0.0) * Math.PI / 180);
    gl2.uniform2f(patternOffsetLocation2, params2.patternOffsetX || 0.0, params2.patternOffsetY || 0.0);
    gl2.uniform1f(patternIntensityLocation2, params2.patternIntensity || 1.0);
    gl2.uniform1f(patternContrastLocation2, params2.patternContrast || 1.0);
    gl2.uniform1f(patternTurbulenceLocation2, params2.patternTurbulence || 0.0);
    let posX2 = params2.positionX || 450;
    let posY2 = params2.positionY || 450;
    if (params2.positionMode === "relative") {
      posX2 = (params2.positionPercentX || 0) * gl2.canvas.width / 200.0;
      posY2 = (params2.positionPercentY || 0) * gl2.canvas.height / 200.0;
    }
    gl2.uniform2f(positionLocation_uniform2, posX2, posY2);
    const rgb1_2 = hexToRgb(params2.colorStop1);
    const rgb2_2 = hexToRgb(params2.colorStop2);
    const rgb3_2 = hexToRgb(params2.colorStop3);
    const rgb4_2 = hexToRgb(params2.colorStop4);
    const rgb5_2 = hexToRgb(params2.colorStop5);
    gl2.uniform3f(colorStop1Location2, rgb1_2[0], rgb1_2[1], rgb1_2[2]);
    gl2.uniform3f(colorStop2Location2, rgb2_2[0], rgb2_2[1], rgb2_2[2]);
    gl2.uniform3f(colorStop3Location2, rgb3_2[0], rgb3_2[1], rgb3_2[2]);
    gl2.uniform3f(colorStop4Location2, rgb4_2[0], rgb4_2[1], rgb4_2[2]);
    gl2.uniform3f(colorStop5Location2, rgb5_2[0], rgb5_2[1], rgb5_2[2]);
    gl2.uniform1f(stopPos1Location2, params2.stopPos1);
    gl2.uniform1f(stopPos2Location2, params2.stopPos2);
    gl2.uniform1f(stopPos3Location2, params2.stopPos3);
    gl2.uniform1f(stopPos4Location2, params2.stopPos4);
    gl2.uniform1f(stopPos5Location2, params2.stopPos5);
    for (let i = 0; i < 10; i++) gl2.uniform1f(controlPointLocations2[i], params2[`controlPoint${i}`]);
    gl2.clearColor(0, 0, 0, 0);
    gl2.clear(gl2.COLOR_BUFFER_BIT);
    gl2.drawArrays(gl2.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
  }

  document.getElementById("_gg_canvas2").style.mixBlendMode = blendMode;
  updateGlobalBlur();
  updateGrain();
  resizeCanvas();
  render();

  // Vignette function
  function updateVignette() {
    const vignette = document.getElementById("vignette");
    if (vignette) {
      const intensity = params.vignetteIntensity || 0.4;
      const color = params.vignetteColor || "#000000";
      const blendMode = params.vignetteBlendMode || "normal";
      
      // Convert hex to rgb
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      vignette.style.background = `radial-gradient(ellipse at center, transparent 0%, rgba(${r}, ${g}, ${b}, ${intensity}) 100%)`;
      vignette.style.mixBlendMode = blendMode;
    }
  }

  // Initialize vignette
  params.vignetteIntensity = 0.5;
  params.vignetteColor = "#ff5900";
  params.vignetteBlendMode = "normal";
  updateVignette();

  // Expose params and functions globally for GUI
  window.GlowGradientParams = params;
  window.GlowGradientParams2 = params2;
  window.GlowGradientUpdateFunctions = {
    updateGlobalBlur: updateGlobalBlur,
    updateGrain: updateGrain,
    updateBlendMode: (mode) => {
      blendMode = mode;
      document.getElementById("_gg_canvas2").style.mixBlendMode = blendMode;
    },
    updateVignette: updateVignette,
    render: render
  };
})();
