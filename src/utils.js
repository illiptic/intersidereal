export function getContainerDimensions (container) {

  if ( container && container !== document ) {

    return {
      size	: [ container.offsetWidth, container.offsetHeight ],
      offset	: [ container.offsetLeft,  container.offsetTop ]
    };

  } else {

    return {
      size	: [ window.innerWidth, window.innerHeight ],
      offset	: [ 0, 0 ]
    };

  }

}
