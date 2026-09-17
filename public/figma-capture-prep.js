/**
 * Prep for Figma code-to-canvas capture:
 * - hide Next.js dev chrome
 * - rasterize Mapbox WebGL canvases to <img> so the basemap survives serialization
 * - replace SVG <image> marker stickers with <img> so outline PNG icons survive serialization
 */
(function () {
  if (!location.hash.includes("figmacapture=")) return;

  function hideDevChrome() {
    document.querySelectorAll("nextjs-portal").forEach(function (el) {
      el.style.setProperty("display", "none", "important");
    });
    document
      .querySelectorAll("[data-nextjs-toast], [data-next-badge-root]")
      .forEach(function (el) {
        el.style.setProperty("display", "none", "important");
      });
  }

  function flattenCanvases() {
    document
      .querySelectorAll(
        "canvas.mapboxgl-canvas, .mapboxgl-canvas-container canvas, canvas",
      )
      .forEach(function (canvas) {
        try {
          var dataUrl = canvas.toDataURL("image/png");
          if (!dataUrl || dataUrl.length < 2000) return;
          var img = document.createElement("img");
          img.src = dataUrl;
          img.alt = "Map basemap";
          img.setAttribute("data-figma-map-png", "true");
          var cs = window.getComputedStyle(canvas);
          var rect = canvas.getBoundingClientRect();
          img.style.cssText = [
            "position:" + cs.position,
            "top:" + cs.top,
            "left:" + cs.left,
            "right:" + cs.right,
            "bottom:" + cs.bottom,
            "width:" + rect.width + "px",
            "height:" + rect.height + "px",
            "max-width:none",
            "object-fit:cover",
            "display:block",
            "pointer-events:none",
            "z-index:" + cs.zIndex,
          ].join(";");
          canvas.parentNode && canvas.parentNode.replaceChild(img, canvas);
        } catch (err) {
          console.warn("[figma-capture-prep] canvas flatten failed", err);
        }
      });
  }

  function flattenSvgMarkerIcons() {
    document.querySelectorAll("svg image, svg image[href], svg image[*|href]").forEach(function (imageEl) {
      try {
        var href =
          imageEl.getAttribute("href") ||
          imageEl.getAttributeNS("http://www.w3.org/1999/xlink", "href") ||
          imageEl.href?.baseVal;
        if (!href) return;
        var svg = imageEl.closest("svg");
        if (!svg || svg.getAttribute("data-figma-marker-flattened")) return;

        var rect = svg.getBoundingClientRect();
        var img = document.createElement("img");
        img.src = href;
        img.alt = "POI marker icon";
        img.setAttribute("data-figma-marker-icon", "true");
        img.width = Math.round(rect.width) || 40;
        img.height = Math.round(rect.height) || 40;
        img.style.cssText = [
          "width:" + (rect.width || 40) + "px",
          "height:" + (rect.height || 40) + "px",
          "display:block",
          "flex-shrink:0",
          "object-fit:contain",
          "filter:drop-shadow(0 1px 2px rgba(0,0,0,0.08))",
        ].join(";");

        svg.setAttribute("data-figma-marker-flattened", "true");
        svg.parentNode && svg.parentNode.replaceChild(img, svg);
      } catch (err) {
        console.warn("[figma-capture-prep] marker flatten failed", err);
      }
    });
  }

  function prep() {
    hideDevChrome();
    flattenSvgMarkerIcons();
    flattenCanvases();
  }

  var params = new URLSearchParams(location.hash.replace(/^#/, ""));
  var delay = Number(params.get("figmadelay") || "1000");
  var flattenAt = Math.max(0, delay - 800);
  setTimeout(prep, flattenAt);
  setTimeout(prep, Math.max(0, delay - 100));
})();
