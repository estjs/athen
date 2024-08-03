import PageLink from '../Link/index';
import './style.scss';

const PageButton = ({
  type,
  size = 'medium',
  theme = 'brand',
  text,
  href,
  external,
  className = '',
}) => {
  if (type === 'button') {
    return <button class={`button ${theme} ${size} ${className}`}>{text}</button>;
  } else if (type === 'a' && external) {
    return (
      <a href={href} class={`button ${theme} ${size} ${className}`}>
        {text}
      </a>
    );
  } else {
    return (
      <PageLink href={href} className={className}>
        <span>{text}</span>
      </PageLink>
    );
  }
};

export default PageButton;
