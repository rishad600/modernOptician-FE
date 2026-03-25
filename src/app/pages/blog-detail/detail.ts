import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorBio: string;
  date: string;
  image: string;
  tags: string[];
}

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class BlogDetailComponent implements OnInit {
  blog: Blog | null = null;
  relatedBlogs: Blog[] = [];

  private allBlogs: Blog[] = [
    {
      id: 'future-digital-optometry',
      title: 'The Future of Digital Optometry',
      excerpt: 'Explore how AI and digital diagnostics are transforming the landscape of eye care and what it means for practitioners.',
      content: `
        <p>The field of optometry is standing on the brink of a digital revolution. Artificial Intelligence (AI) and advanced digital diagnostics are no longer concepts of the future—they are here, and they are changing how we care for patients.</p>
        <h2>The Integration of AI</h2>
        <p>AI algorithms are now capable of analyzing retinal images with precision that rivals expert clinicians. By automating the screening process for conditions like diabetic retinopathy and glaucoma, AI allows specialists to focus on complex cases while ensuring that no patient is left behind.</p>
        <h2>Virtual Reality in Training and Diagnosis</h2>
        <p>Virtual Reality (VR) is becoming a cornerstone of both optometric education and patient diagnostics. Students can now practice complex procedures in a risk-free virtual environment, while patients use VR headsets for more immersive and accurate visual field testing.</p>
        <blockquote>"Digital transformation isn't just about new tools; it's about a fundamental shift in how we deliver value to our patients."</blockquote>
        <h2>Conclusion</h2>
        <p>As we embrace these technologies, the role of the modern optician will evolve. We will become data interpreters and strategic advisors, using these powerful tools to provide more personalized and proactive eye care than ever before.</p>
      `,
      author: 'Dr. Sarah Wilson',
      authorBio: 'Lead Instructor at Modern Optician with 15 years of clinical experience.',
      date: 'March 15, 2024',
      image: 'images/digital_optometry_blog.png',
      tags: ['Technology', 'AI', 'Future']
    },
    {
      id: 'progressive-lens-designs',
      title: 'Understanding Progressive Lens Designs',
      excerpt: 'A deep dive into the physics and geometry behind modern progressive lenses and how to prescribe them effectively.',
      content: `
        <p>Progressive Addition Lenses (PALs) have come a long way since their inception. Today's "free-form" digital surfacing has allowed for a level of customization that was previously impossible.</p>
        <h2>The Geometry of Comfort</h2>
        <p>Modern progressive lenses are designed using complex mathematical surfaces that minimize unwanted astigmatism in the periphery. Understanding the "corridor width" and "inset" is crucial for matching a lens to a patient's visual needs.</p>
        <h2>Prescribing with Precision</h2>
        <p>Success with PALs starts with the refraction. Accurate vertex distance, pantoscopic tilt, and wrap angle measurements are essential when utilizing digital surfacing technology to ensure the patient gets the full benefit of the design.</p>
        <ul>
          <li>Always measure the monocular PD.</li>
          <li>Consider the patient's posture and primary tasks.</li>
          <li>Educate the patient on the adaptation process.</li>
        </ul>
        <p>By mastering these clinical details, we can ensure our patients enjoy seamless vision at all distances.</p>
      `,
      author: 'James Chen',
      authorBio: 'Optical Specialist focusing on lens technology and advanced optics.',
      date: 'March 12, 2024',
      image: 'images/progressive_lens_blog.png',
      tags: ['Clinical', 'Opthalmology', 'Lenses']
    },
    {
      id: 'customer-service-excellence',
      title: 'Customer Service Excellence in Optical Retail',
      excerpt: 'Building trust and loyalty in your practice starts with the first interaction. Learn key strategies for retail success.',
      content: `
        <p>In the competitive world of optical retail, clinical expertise is only half of the equation. The other half is the experience we provide to our customers.</p>
        <h2>First Impressions Matter</h2>
        <p>From the moment a patient walks through the door, every detail speaks volumes about your brand. A clean, modern environment and a warm greeting set the stage for a positive experience.</p>
        <h2>Consultative Selling</h2>
        <p>We shouldn't just be "selling glasses"; we should be providing solutions. By asking the right questions about a patient's lifestyle and hobbies, we can recommend the perfect combination of frames and lenses that truly enhance their lives.</p>
        <p>Remember, a loyal patient is worth far more than a single sale. Focus on building relationships, and the business growth will follow naturally.</p>
      `,
      author: 'Elena Rodriguez',
      authorBio: 'Course Coordinator and expert in optical retail management.',
      date: 'March 10, 2024',
      image: 'images/optical_retail_blog.png',
      tags: ['Business', 'Retail', 'Customer Care']
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.blog = this.allBlogs.find(b => b.id === id) || null;
      if (this.blog) {
        this.relatedBlogs = this.allBlogs.filter(b => b.id !== id).slice(0, 3);
      }
    });
  }
}
